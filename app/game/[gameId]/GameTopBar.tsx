"use client";

import { Shield, Swords, Users } from "lucide-react";
import { PHASES } from "./gameData";
import type { Phase } from "./gameData";
import type { GamePageController } from "./useGamePageController";

type PlayerStat = GamePageController["playerStats"][number];

const phaseIcon = (phase: Phase) => {
  switch (phase) {
    case "Deploy":
      return <Users size={18} />;
    case "Attack":
      return <Swords size={18} />;
    case "Fortify":
      return <Shield size={18} />;
  }
};

const GameTopBar = ({
  currentTurn,
  playerStats,
  currentPlayer,
  currentPhase,
  phaseIndex,
  isMyTurn,
  reinforcements,
  myPlayerId,
  onNextPhase,
  onSurrender,
}: {
  currentTurn: number;
  playerStats: PlayerStat[];
  currentPlayer: number;
  currentPhase: Phase;
  phaseIndex: number;
  isMyTurn: boolean;
  reinforcements: number;
  myPlayerId: number | null;
  onNextPhase: () => void;
  onSurrender: () => void;
}) => (
  <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-amber-900/40">
    <div className="flex items-center gap-3">
      <span className="text-amber-400/70 text-xs font-mono uppercase tracking-wider">
        Turn {currentTurn}
      </span>
      <div className="w-px h-4 bg-amber-900/40" />
      <div className="flex items-center gap-1.5">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: playerStats[currentPlayer]?.color }}
        />
        <span className="text-amber-200/80 text-sm font-semibold">
          {playerStats[currentPlayer]?.name}&apos;s Turn
        </span>
      </div>
      <div className="w-px h-4 bg-amber-900/40" />
      <div className="flex items-center gap-1.5 bg-amber-700/20 border border-amber-500/30 rounded px-2.5 py-1">
        <Users size={14} className="text-amber-400" />
        <span className="text-amber-200 text-sm font-bold font-mono">
          {playerStats[currentPlayer]?.troops}
        </span>
        <span className="text-amber-400/60 text-[10px] uppercase tracking-wider">
          troops
        </span>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {PHASES.map((phase, i) => {
        const isActive = currentPhase === phase;
        const activeStyle = {
          Deploy:
            "bg-green-600/25 text-green-200 border border-green-500/50 shadow-lg shadow-green-900/30",
          Attack:
            "bg-red-600/25 text-red-200 border border-red-500/50 shadow-lg shadow-red-900/30",
          Fortify:
            "bg-blue-600/25 text-blue-200 border border-blue-500/50 shadow-lg shadow-blue-900/30",
        }[phase];
        const hintClass = isMyTurn
          ? {
              Deploy: "phase-hint-green",
              Attack: "phase-hint-red",
              Fortify: "phase-hint-blue",
            }[phase]
          : "";
        return (
          <div
            key={phase}
            className={`flex min-h-11 items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all
                  ${
                    isActive
                      ? `${activeStyle} ${hintClass}`
                      : i <= phaseIndex
                        ? "bg-white/5 text-amber-600/50 border border-transparent"
                        : "bg-white/5 text-white/25 border border-transparent"
                  }`}
          >
            {phaseIcon(phase)}
            {phase}
          </div>
        );
      })}
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onNextPhase}
        disabled={
          !isMyTurn || (currentPhase === "Deploy" && reinforcements > 0)
        }
        className={`w-36 px-5 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-all ${
          isMyTurn && !(currentPhase === "Deploy" && reinforcements > 0)
            ? `bg-amber-700/50 hover:bg-amber-600/60 text-amber-100 border-amber-500/30 hover:shadow-lg hover:shadow-amber-900/30 cursor-pointer ${
                currentPhase === "Deploy" && reinforcements === 0
                  ? "phase-hint-amber"
                  : ""
              }`
            : "bg-white/5 text-white/20 border-white/10 cursor-not-allowed"
        }`}
      >
        {phaseIndex < PHASES.length - 1 ? "Skip Phase" : "End Turn"} &rarr;
      </button>

      <button
        onClick={onSurrender}
        disabled={!myPlayerId}
        className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-all ${
          myPlayerId
            ? "bg-red-900/40 hover:bg-red-800/50 text-red-300 border-red-500/30 cursor-pointer"
            : "bg-white/5 text-white/20 border-white/10 cursor-not-allowed"
        }`}
      >
        Surrender
      </button>
    </div>
  </div>
);

export default GameTopBar;
