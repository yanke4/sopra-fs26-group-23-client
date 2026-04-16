"use client";

import React from "react";
import { Crown, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import type { GameStateDTO } from "@/types/game";
import { COLOR_MAP } from "@/game/[gameId]/gameData";

export interface TroopSnapshot {
  turn: number;
  troops: Record<number, number>; // playerId -> troop count
}

interface VictoryScreenProps {
  gameState: GameStateDTO;
  currentUserId: number | null;
  troopHistory?: TroopSnapshot[];
}

function TroopChart({
  history,
  players,
}: {
  history: TroopSnapshot[];
  players: GameStateDTO["players"];
}) {
  if (history.length < 2) return null;

  const pad = { top: 20, right: 16, bottom: 28, left: 34 };
  const w = 440;
  const h = 180;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const allValues = history.flatMap((s) => Object.values(s.troops));
  const maxVal = Math.max(...allValues, 1);
  const minTurn = history[0].turn;
  const maxTurn = history[history.length - 1].turn;
  const turnSpan = maxTurn - minTurn || 1;

  const x = (turn: number) => pad.left + ((turn - minTurn) / turnSpan) * innerW;
  const y = (val: number) => pad.top + innerH - (val / maxVal) * innerH;

  const gridLines = 4;
  const gridVals = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((maxVal / gridLines) * i),
  );

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: w }}>
      {gridVals.map((v) => (
        <g key={`grid-${v}`}>
          <line
            x1={pad.left}
            x2={w - pad.right}
            y1={y(v)}
            y2={y(v)}
            stroke="#FFD900"
            strokeOpacity={0.08}
            strokeWidth={0.5}
          />
          <text
            x={pad.left - 6}
            y={y(v)}
            textAnchor="end"
            dominantBaseline="central"
            fill="#FFD900"
            fillOpacity={0.3}
            fontSize={9}
            fontFamily="monospace"
          >
            {v}
          </text>
        </g>
      ))}

      {history
        .filter(
          (_, i) =>
            i % Math.max(1, Math.floor(history.length / 6)) === 0 ||
            i === history.length - 1,
        )
        .map((s) => (
          <text
            key={`t-${s.turn}`}
            x={x(s.turn)}
            y={h - 6}
            textAnchor="middle"
            fill="#FFD900"
            fillOpacity={0.3}
            fontSize={9}
            fontFamily="monospace"
          >
            {s.turn}
          </text>
        ))}

      {players.map((p) => {
        const color = COLOR_MAP[p.color] ?? "#888";
        const points = history
          .filter((s) => s.troops[p.playerId] !== undefined)
          .map((s) => `${x(s.turn)},${y(s.troops[p.playerId])}`)
          .join(" ");

        if (!points) return null;

        return (
          <g key={p.playerId}>
            {/* Glow */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeOpacity={0.15}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={1.8}
              strokeOpacity={0.85}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {history.length > 0 && (
              <circle
                cx={x(history[history.length - 1].turn)}
                cy={y(history[history.length - 1].troops[p.playerId] ?? 0)}
                r={3}
                fill={color}
                opacity={0.9}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  gameState,
  currentUserId,
  troopHistory = [],
}) => {
  const router = useRouter();

  const alivePlayers = gameState.players.filter((p) => p.alive);
  const winner = alivePlayers.length === 1 ? alivePlayers[0] : null;
  if (!winner) return null;

  const winnerColor = COLOR_MAP[winner.color] ?? "#FFD900";
  const isMe = winner.userId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
        style={{
          background: `radial-gradient(circle, #FFD900 0%, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-500">
        <div
          className="h-px"
          style={{
            background: `linear-gradient(90deg, transparent, #FFD900, transparent)`,
          }}
        />

        <div className="border border-[#FFD900]/12 bg-[rgba(14,12,6,0.95)] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col items-center pt-8 pb-4 px-6">
            <div className="relative mb-3">
              <div className="absolute inset-0 blur-xl opacity-30 rounded-full bg-[#FFD900]" />
              <Crown
                size={44}
                className="relative text-[#FFD900]"
                strokeWidth={1.5}
              />
            </div>

            <span className="font-audiowide text-[10px] tracking-[0.4em] text-[#FFD900]/50 uppercase mb-3">
              {isMe ? "Victory is yours" : "Conquest complete"}
            </span>

            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-white/15"
                style={{ backgroundColor: winnerColor }}
              />
              <span
                className="font-audiowide text-3xl font-bold tracking-wide"
                style={{ color: winnerColor }}
              >
                {isMe ? "You" : winner.username}
              </span>
            </div>

            <p className="font-audiowide text-[10px] tracking-[0.2em] text-white/35 uppercase">
              {isMe ? "Emperor of Europe" : "has conquered Europe"}
            </p>
          </div>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#FFD900]/20 to-transparent" />

          {troopHistory.length >= 2 && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <Swords size={12} className="text-[#FFD900]/40" />
                <h3 className="font-audiowide text-[9px] tracking-[0.3em] text-[#FFD900]/40 uppercase">
                  Troop Progression
                </h3>
              </div>

              <div className="p-3 rounded-md border border-[#FFD900]/8 bg-[rgba(14,12,6,0.6)]">
                <TroopChart
                  history={troopHistory}
                  players={gameState.players}
                />

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
                  {gameState.players.map((p) => (
                    <div key={p.playerId} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: COLOR_MAP[p.color] ?? "#888",
                        }}
                      />
                      <span className="text-[10px] text-white/40 font-mono">
                        {p.userId === currentUserId ? "You" : p.username}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mx-6 h-px bg-linear-to-r from-transparent via-[#FFD900]/20 to-transparent" />

          <div className="px-6 py-4">
            <h3 className="font-audiowide text-[9px] tracking-[0.3em] text-[#FFD900]/40 uppercase mb-3">
              Final Standings
            </h3>
            <div className="space-y-1.5">
              {gameState.players
                .map((p) => {
                  const ownedFields = gameState.fields.filter(
                    (f) => f.ownerPlayerId === p.playerId,
                  );
                  return {
                    ...p,
                    territories: ownedFields.length,
                    totalTroops: ownedFields.reduce(
                      (sum, f) => sum + f.troops,
                      0,
                    ),
                    color: COLOR_MAP[p.color] ?? "#888",
                  };
                })
                .sort(
                  (a, b) =>
                    b.territories - a.territories ||
                    b.totalTroops - a.totalTroops,
                )
                .map((p, rank) => {
                  const isWinner = p.playerId === winner.playerId;
                  const isCurrentUser = p.userId === currentUserId;
                  return (
                    <div
                      key={p.playerId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                        isWinner
                          ? "bg-[#FFD900]/8 border border-[#FFD900]/20"
                          : "bg-white/2 border border-transparent"
                      }`}
                    >
                      <div className="w-5 shrink-0">
                        {rank === 0 ? (
                          <Crown size={13} className="text-[#FFD900]" />
                        ) : (
                          <span className="text-[11px] text-white/20 font-mono">
                            #{rank + 1}
                          </span>
                        )}
                      </div>

                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span
                        className={`text-sm flex-1 ${
                          isWinner
                            ? "font-semibold text-[#FFD900]/90"
                            : p.alive
                              ? "text-white/50"
                              : "text-white/20 line-through"
                        }`}
                      >
                        {isCurrentUser ? "You" : p.username}
                      </span>

                      {!p.alive && (
                        <span className="text-[8px] text-red-400/40 uppercase tracking-wider font-audiowide">
                          Eliminated
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="px-6 pb-6 pt-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-md font-audiowide text-xs tracking-[0.2em] uppercase transition-all cursor-pointer bg-[#FFD900] text-[#0e0c06] font-bold shadow-[0_0_24px_rgba(255,217,0,0.3)] hover:bg-[#ffe44d] hover:shadow-[0_0_36px_rgba(255,217,0,0.55)] active:scale-[0.98]"
            >
              Return to Base
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
