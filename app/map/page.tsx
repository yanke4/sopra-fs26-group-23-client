"use client";

import EuropeMap from "@/components/europemap";
import React, { useState } from "react";
import { Swords, Shield, Flag, Dice5, Users } from "lucide-react";

const PHASES = ["Deploy", "Attack", "Fortify"] as const;
type Phase = (typeof PHASES)[number];

interface Player {
  name: string;
  color: string;
  troops: number;
  territories: number;
}

const PLAYERS: Player[] = [
  { name: "You", color: "#E63946", troops: 24, territories: 5 },
  { name: "Player 2", color: "#FFD60A", troops: 18, territories: 4 },
  { name: "Player 3", color: "#2D6A4F", troops: 15, territories: 3 },
  { name: "Player 4", color: "#4361EE", troops: 12, territories: 2 },
];

const LOGS = [
  { text: "You deployed 3 troops to Italy", icon: "deploy" },
  { text: "Player 2 attacked Spain from France", icon: "attack" },
  { text: "Player 3 fortified Germany", icon: "fortify" },
  { text: "You conquered Switzerland!", icon: "conquer" },
  { text: "Player 4 deployed 2 troops to Poland", icon: "deploy" },
];

const GamePage = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>("Deploy");
  const [currentTurn, setCurrentTurn] = useState(1);
  const [reinforcements, setReinforcements] = useState(5);

  const phaseIndex = PHASES.indexOf(currentPhase);

  const nextPhase = () => {
    if (phaseIndex < PHASES.length - 1) {
      setCurrentPhase(PHASES[phaseIndex + 1]);
    } else {
      setCurrentPhase(PHASES[0]);
      setCurrentTurn((t) => t + 1);
    }
  };

  const phaseIcon = (phase: Phase) => {
    switch (phase) {
      case "Deploy":
        return <Users size={16} />;
      case "Attack":
        return <Swords size={16} />;
      case "Fortify":
        return <Shield size={16} />;
    }
  };

  const logIcon = (type: string) => {
    switch (type) {
      case "deploy":
        return <Users size={14} className="text-green-400" />;
      case "attack":
        return <Swords size={14} className="text-red-400" />;
      case "fortify":
        return <Shield size={14} className="text-blue-400" />;
      case "conquer":
        return <Flag size={14} className="text-yellow-400" />;
      default:
        return <Dice5 size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden select-none">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-amber-900/40">
        <div className="flex items-center gap-3"></div>

        <div className="flex items-center gap-1">
          {PHASES.map((phase, i) => (
            <button
              key={phase}
              onClick={() => setCurrentPhase(phase)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all
                ${
                  currentPhase === phase
                    ? "bg-amber-600/30 text-amber-200 border border-amber-500/50 shadow-lg shadow-amber-900/20"
                    : i <= phaseIndex
                      ? "bg-white/5 text-amber-600/60 border border-transparent"
                      : "bg-white/5 text-white/30 border border-transparent"
                }`}
            >
              {phaseIcon(phase)}
              {phase}
            </button>
          ))}
        </div>

        <button
          onClick={nextPhase}
          className="px-5 py-1.5 bg-amber-700/60 hover:bg-amber-600/70 text-amber-100 rounded-md text-sm font-bold border border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-900/30"
        >
          {phaseIndex < PHASES.length - 1 ? "Next Phase" : "End Turn"} →
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 bg-black/30 border-r border-amber-900/30 flex flex-col">
          <div className="px-3 py-2 border-b border-amber-900/20">
            <h3 className="text-amber-400/80 text-xs font-bold uppercase tracking-widest">
              Players
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {PLAYERS.map((player, i) => (
              <div
                key={player.name}
                className={`rounded-lg p-2.5 transition-all ${
                  i === 0
                    ? "bg-amber-900/20 border border-amber-500/30 shadow-md"
                    : "bg-white/5 border border-transparent hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-3 h-3 rounded-full shadow-inner"
                    style={{ backgroundColor: player.color }}
                  />
                  <span
                    className={`text-sm font-semibold ${i === 0 ? "text-amber-200" : "text-white/70"}`}
                  >
                    {player.name}
                  </span>
                  {i === 0 && (
                    <span className="ml-auto text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                      YOUR TURN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-white/40" />
                    {player.troops}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flag size={12} className="text-white/40" />
                    {player.territories}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {currentPhase === "Deploy" && (
            <div className="p-3 border-t border-amber-900/20 bg-green-900/10">
              <div className="text-xs text-green-400/80 font-bold uppercase tracking-wider mb-1">
                Reinforcements
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-green-400" size={20} />
                <span className="text-green-300 text-2xl font-bold">
                  {reinforcements}
                </span>
                <span className="text-green-400/60 text-xs">troops left</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden bg-[#0a0908]">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,200,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,50,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          <EuropeMap />
        </div>

        <div className="w-60 bg-black/30 border-l border-amber-900/30 flex flex-col">
          <div className="border-b border-amber-900/20">
            <div className="px-3 py-2 border-b border-amber-900/20">
              <h3 className="text-amber-400/80 text-xs font-bold uppercase tracking-widest">
                Actions
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {currentPhase === "Deploy" && (
                <div className="text-center text-sm text-amber-200/70 py-2">
                  <Users className="text-amber-400/60 mx-auto mb-2" size={28} />
                  Select a territory to deploy troops
                </div>
              )}
              {currentPhase === "Attack" && (
                <>
                  <div className="text-center text-sm text-red-300/70 py-2">
                    <Swords
                      className="text-red-400/60 mx-auto mb-2"
                      size={28}
                    />
                    Select your territory, then an enemy neighbor
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-red-900/30 hover:bg-red-800/40 text-red-300 rounded-md text-xs font-bold border border-red-500/30 transition-all flex items-center justify-center gap-1">
                      <Dice5 size={14} /> Roll Dice
                    </button>
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/50 rounded-md text-xs font-bold border border-white/10 transition-all">
                      Skip
                    </button>
                  </div>
                </>
              )}
              {currentPhase === "Fortify" && (
                <div className="text-center text-sm text-blue-300/70 py-2">
                  <Shield className="text-blue-400/60 mx-auto mb-2" size={28} />
                  Move troops between connected territories
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-amber-900/20">
            <div className="px-3 py-2 border-b border-amber-900/20">
              <h3 className="text-amber-400/80 text-xs font-bold uppercase tracking-widest">
                Selected Territory
              </h3>
            </div>
            <div className="p-3 text-center text-white/30 text-sm py-4">
              Click a territory on the map
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-amber-900/20">
              <h3 className="text-amber-400/80 text-xs font-bold uppercase tracking-widest">
                Battle Log
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {LOGS.map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded bg-white/5 text-xs text-white/60"
                >
                  <span className="mt-0.5">{logIcon(log.icon)}</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
