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

export interface GameStartDTO {
  lobbyId: number;
  gameId: number;
}

interface UseLobbySocketOptions {
  lobbyId: number | null;
  onLobbyUpdate: (lobby: LobbyWebSocketDTO) => void;
  onGameStart?: (data: GameStartDTO) => void;
}

/**
 * Connects to the server's STOMP WebSocket and subscribes to
 * /topic/lobby/{lobbyId}. Calls onLobbyUpdate whenever a message arrives.
 * Automatically cleans up the connection when the component unmounts.
 */
export function useLobbySocket({ lobbyId, onLobbyUpdate, onGameStart }: UseLobbySocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onLobbyUpdateRef = useRef(onLobbyUpdate);
  const onGameStartRef = useRef(onGameStart);

  // Keep the callback refs current without triggering reconnects
  useEffect(() => {
    onLobbyUpdateRef.current = onLobbyUpdate;
  }, [onLobbyUpdate]);

  useEffect(() => {
    onGameStartRef.current = onGameStart;
  }, [onGameStart]);

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
            const data = JSON.parse(message.body);
            // GameStartDTO has gameId but no status field
            if ("gameId" in data && onGameStartRef.current) {
              onGameStartRef.current(data as GameStartDTO);
            } else {
              onLobbyUpdateRef.current(data as LobbyWebSocketDTO);
            }
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