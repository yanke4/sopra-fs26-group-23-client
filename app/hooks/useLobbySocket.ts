"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getApiDomain } from "@/utils/domain";

export interface LobbyWebSocketDTO {
  lobbyId: number;
  status: "OPEN" | "CLOSED";
  joinCode: number;
  hostId: number;
  jointUserIds: number[];
}

interface UseLobbySocketOptions {
  lobbyId: number | null;
  onLobbyUpdate: (lobby: LobbyWebSocketDTO) => void;
}

/**
 * Connects to the server's STOMP WebSocket and subscribes to
 * /topic/lobby/{lobbyId}. Calls onLobbyUpdate whenever a message arrives.
 * Automatically cleans up the connection when the component unmounts.
 */
export function useLobbySocket({ lobbyId, onLobbyUpdate }: UseLobbySocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onLobbyUpdateRef = useRef(onLobbyUpdate);

  // Keep the callback ref current without triggering reconnects
  useEffect(() => {
    onLobbyUpdateRef.current = onLobbyUpdate;
  }, [onLobbyUpdate]);

  useEffect(() => {
    if (lobbyId === null) return;

    const baseUrl = getApiDomain().replace(/\/$/, "");

    const client = new Client({
      // SockJS matches the .withSockJS() config on the server
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/lobby/${lobbyId}`, (message: IMessage) => {
          try {
            const data: LobbyWebSocketDTO = JSON.parse(message.body);
            onLobbyUpdateRef.current(data);
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [lobbyId]); // only reconnect if the lobbyId changes
}