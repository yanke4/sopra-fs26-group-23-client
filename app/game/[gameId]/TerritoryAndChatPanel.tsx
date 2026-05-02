"use client";

import GameChat from "@/components/GameChat";
import { Swords, Users } from "lucide-react";
import { ADJACENCY } from "./gameData";
import type { GamePageController } from "./useGamePageController";

type PlayerStat = GamePageController["playerStats"][number];

const TerritoryAndChatPanel = ({
  gameId,
  myPlayerId,
  currentUser,
  selectedInfo,
  selectedTerritory,
  targetInfo,
  targetTerritory,
  mapColors,
  playerStats,
}: {
  gameId: number | null;
  myPlayerId: number | null;
  currentUser: GamePageController["currentUser"];
  selectedInfo: GamePageController["selectedInfo"];
  selectedTerritory: string | null;
  targetInfo: GamePageController["targetInfo"];
  targetTerritory: string | null;
  mapColors: string[];
  playerStats: PlayerStat[];
}) => (
  <div
    className="w-56 bg-black/40 border-l border-amber-900/30 flex flex-col"
    style={{ height: "100%" }}
  >
    <div
      className="border-b border-amber-900/20"
      style={{ maxHeight: "40%", overflowY: "auto" }}
    >
      <div className="px-3 py-2 border-b border-amber-900/20">
        <h3 className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest">
          Territory
        </h3>
      </div>
      {selectedInfo ? (
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: mapColors[selectedInfo.owner],
              }}
            />
            <span className="text-sm text-white/90 font-semibold">
              {selectedTerritory}
            </span>
          </div>
          <div className="flex gap-3 text-[11px] text-white/50">
            <span>
              Owner:{" "}
              <span style={{ color: mapColors[selectedInfo.owner] }}>
                {playerStats[selectedInfo.owner]?.name ?? "Neutral"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/50">
            <Users size={11} />
            <span className="text-white/80 font-bold">
              {selectedInfo.troops}
            </span>{" "}
            troops
          </div>
          <div className="text-[10px] text-white/30 mt-1">
            <span className="uppercase tracking-wider">Borders: </span>
            {(ADJACENCY[selectedTerritory!] || []).join(", ")}
          </div>

          {targetTerritory && targetInfo && (
            <div className="mt-2 pt-2 border-t border-amber-900/20 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-red-400/70 uppercase tracking-wider font-bold">
                <Swords size={10} /> Target
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: mapColors[targetInfo.owner],
                  }}
                />
                <span className="text-xs text-white/80">{targetTerritory}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                <Users size={11} />
                <span className="text-white/80 font-bold">
                  {targetInfo.troops}
                </span>{" "}
                troops
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 text-center text-white/20 text-xs py-5">
          Click a territory on the map
        </div>
      )}
    </div>

    <div
      style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {myPlayerId && (
        <GameChat
          key={gameId}
          gameId={String(gameId ?? "0")}
          currentUser={currentUser}
          apiUrl={process.env.NEXT_PUBLIC_PROD_API_URL ?? "http://localhost:8080"}
        />
      )}
    </div>
  </div>
);

export default TerritoryAndChatPanel;
