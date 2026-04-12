"use client";

import { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getApiDomain } from "@/utils/domain";
import type { GameStateDTO } from "@/types/game";

interface UseGameSocketOptions {
  gameId: number | null;
  onGameUpdate: (state: GameStateDTO) => void;
}

export function useGameSocket({ gameId, onGameUpdate }: UseGameSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onGameUpdateRef = useRef(onGameUpdate);

  useEffect(() => {
    onGameUpdateRef.current = onGameUpdate;
  }, [onGameUpdate]);

  useEffect(() => {
    if (gameId === null) return;

    const baseUrl = getApiDomain().replace(/\/$/, "");

    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/game/${gameId}`, (message: IMessage) => {
          try {
            const data: GameStateDTO = JSON.parse(message.body);
            onGameUpdateRef.current(data);
          } catch (e) {
            console.error("Failed to parse game WebSocket message:", e);
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
  }, [gameId]);
}