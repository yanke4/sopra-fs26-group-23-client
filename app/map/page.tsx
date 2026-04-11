"use client";

import EuropeMap, { TerritoryState } from "@/components/europe-map";
import React, { useState, useMemo } from "react";
import { Swords, Shield, Flag, Dice5, Users, MapPin } from "lucide-react";
import { ApiService } from "@/api/apiService";
import type { AttackPayload } from "@/types/game";

const PHASES = ["Deploy", "Attack", "Fortify"] as const;
type Phase = (typeof PHASES)[number];

const PLAYER_COLORS = ["#E63946", "#4361EE", "#2D6A4F", "#FFD60A"];
const PLAYER_NAMES = ["You", "Player 2", "Player 3", "Player 4"];

const ADJACENCY: Record<string, string[]> = {
  Spain: ["Portugal", "France"],
  Portugal: ["Spain"],
  France: [
    "Spain",
    "Belgium",
    "Germany",
    "Switzerland",
    "Italy",
    "Great Britain",
  ],
  Belgium: ["France", "Netherlands", "Germany"],
  Netherlands: ["Belgium", "Germany", "Great Britain"],
  Germany: [
    "France",
    "Belgium",
    "Netherlands",
    "Denmark",
    "Poland",
    "Czechia",
    "Austria",
    "Switzerland",
  ],
  Switzerland: ["France", "Germany", "Austria", "Italy"],
  Italy: ["France", "Switzerland", "Austria", "Balkans"],
  Austria: [
    "Germany",
    "Switzerland",
    "Italy",
    "Czechia",
    "Slovakia",
    "Hungary",
    "Balkans",
  ],
  Czechia: ["Germany", "Poland", "Slovakia", "Austria"],
  Poland: [
    "Germany",
    "Denmark",
    "Lithuania",
    "Belarus",
    "Ukraine",
    "Slovakia",
    "Czechia",
  ],
  Denmark: ["Germany", "Sweden", "Norway", "Poland"],
  Sweden: ["Denmark", "Norway", "Finland"],
  Norway: ["Denmark", "Sweden", "Finland", "Iceland", "Great Britain"],
  Finland: ["Sweden", "Norway", "Estonia"],
  Iceland: ["Norway", "Great Britain"],
  "Great Britain": ["Ireland", "France", "Netherlands", "Norway", "Iceland"],
  Ireland: ["Great Britain"],
  Estonia: ["Finland", "Latvia"],
  Latvia: ["Estonia", "Lithuania", "Belarus"],
  Lithuania: ["Latvia", "Poland", "Belarus"],
  Belarus: ["Lithuania", "Latvia", "Poland", "Ukraine"],
  Ukraine: ["Poland", "Belarus", "Moldova", "Romania", "Hungary", "Slovakia"],
  Slovakia: ["Poland", "Czechia", "Austria", "Hungary", "Ukraine"],
  Hungary: ["Austria", "Slovakia", "Ukraine", "Romania", "Balkans"],
  Romania: ["Ukraine", "Moldova", "Bulgaria", "Balkans", "Hungary"],
  Moldova: ["Ukraine", "Romania"],
  Bulgaria: ["Romania", "Greece", "Turkey", "Balkans"],
  Balkans: ["Italy", "Austria", "Hungary", "Romania", "Bulgaria", "Greece"],
  Greece: ["Balkans", "Bulgaria", "Turkey"],
  Turkey: ["Bulgaria", "Greece"],
};

// Mock territory distribution for visual display
const MOCK_TERRITORIES: Record<string, TerritoryState> = {
  Spain: { owner: 0, troops: 4 },
  Portugal: { owner: 0, troops: 2 },
  France: { owner: 0, troops: 6 },
  Belgium: { owner: 0, troops: 2 },
  Italy: { owner: 0, troops: 5 },
  Switzerland: { owner: 0, troops: 3 },
  Ireland: { owner: 0, troops: 1 },
  "Great Britain": { owner: 0, troops: 3 },
  Netherlands: { owner: 1, troops: 3 },
  Germany: { owner: 1, troops: 7 },
  Denmark: { owner: 1, troops: 2 },
  Poland: { owner: 1, troops: 4 },
  Czechia: { owner: 1, troops: 2 },
  Austria: { owner: 1, troops: 3 },
  Iceland: { owner: 1, troops: 1 },
  Norway: { owner: 2, troops: 4 },
  Sweden: { owner: 2, troops: 3 },
  Finland: { owner: 2, troops: 2 },
  Estonia: { owner: 2, troops: 1 },
  Latvia: { owner: 2, troops: 2 },
  Lithuania: { owner: 2, troops: 2 },
  Belarus: { owner: 2, troops: 3 },
  Slovakia: { owner: 3, troops: 2 },
  Hungary: { owner: 3, troops: 3 },
  Romania: { owner: 3, troops: 4 },
  Moldova: { owner: 3, troops: 1 },
  Bulgaria: { owner: 3, troops: 2 },
  Balkans: { owner: 3, troops: 3 },
  Greece: { owner: 3, troops: 2 },
  Turkey: { owner: 3, troops: 3 },
  Ukraine: { owner: 3, troops: 5 },
};

const MOCK_LOGS = [
  { text: "You deployed 3 troops to Italy", icon: "deploy" as const },
  { text: "Player 2 attacked France from Germany", icon: "attack" as const },
  { text: "Player 3 fortified Norway", icon: "fortify" as const },
  { text: "You conquered Switzerland!", icon: "conquer" as const },
  { text: "Player 4 deployed 2 troops to Ukraine", icon: "deploy" as const },
  {
    text: "Player 2 attacked Belgium from Netherlands",
    icon: "attack" as const,
  },
  { text: "You defended France successfully!", icon: "defend" as const },
];

const GamePage = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>("Deploy");
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(
    null,
  );
  const [targetTerritory, setTargetTerritory] = useState<string | null>(null);

  const currentPlayer = 0; // visual only
  const currentTurn = 3;
  const reinforcements = 5;


  const phaseIndex = PHASES.indexOf(currentPhase);

  // Compute player stats from territories
  const playerStats = useMemo(() => {
    return PLAYER_NAMES.map((name, i) => {
      const owned = Object.values(MOCK_TERRITORIES).filter(
        (t) => t.owner === i,
      );
      return {
        name,
        color: PLAYER_COLORS[i],
        territories: owned.length,
        troops: owned.reduce((sum, t) => sum + t.troops, 0),
      };
    });
  }, []);

  // Compute valid targets based on phase and selection
  const validTargets = useMemo(() => {
    if (!selectedTerritory) return [];
    const neighbors = ADJACENCY[selectedTerritory] || [];
    const selectedOwner = MOCK_TERRITORIES[selectedTerritory]?.owner;

    if (currentPhase === "Attack") {
      return neighbors.filter(
        (n) => MOCK_TERRITORIES[n]?.owner !== selectedOwner,
      );
    }
    if (currentPhase === "Fortify") {
      return neighbors.filter(
        (n) => MOCK_TERRITORIES[n]?.owner === selectedOwner,
      );
    }
    return [];
  }, [selectedTerritory, currentPhase]);

  const handleTerritoryClick = (name: string) => {
    const territory = MOCK_TERRITORIES[name];
    if (!territory) return;

    // Toggle selection on any territory
    setSelectedTerritory(name === selectedTerritory ? null : name);
    setTargetTerritory(null);

    if (currentPhase === "Attack") {
      if (
        selectedTerritory &&
        selectedTerritory !== name &&
        validTargets.includes(name)
      ) {
        setTargetTerritory(name);
      }
    } else if (currentPhase === "Fortify") {
      if (
        selectedTerritory &&
        selectedTerritory !== name &&
        validTargets.includes(name)
      ) {
        setTargetTerritory(name);
      }
    }
  };

  const handlePhaseChange = (phase: Phase) => {
    setCurrentPhase(phase);
    setSelectedTerritory(null);
    setTargetTerritory(null);
  };

const handleAttack = async () => {
  if (!selectedTerritory || !targetTerritory) return;

  const nextPhase = () => {
    const next =
      phaseIndex < PHASES.length - 1 ? PHASES[phaseIndex + 1] : PHASES[0];
    handlePhaseChange(next);
  };

  const selectedInfo = selectedTerritory
    ? MOCK_TERRITORIES[selectedTerritory]
    : null;
  const targetInfo = targetTerritory ? MOCK_TERRITORIES[targetTerritory] : null;

  const phaseIcon = (phase: Phase) => {
    switch (phase) {
      case "Deploy":
        return <Users size={14} />;
      case "Attack":
        return <Swords size={14} />;
      case "Fortify":
        return <Shield size={14} />;
    }
  };

  const logIcon = (type: string) => {
    switch (type) {
      case "deploy":
        return <Users size={13} className="text-green-400" />;
      case "attack":
        return <Swords size={13} className="text-red-400" />;
      case "fortify":
        return <Shield size={13} className="text-blue-400" />;
      case "conquer":
        return <Flag size={13} className="text-yellow-400" />;
      case "defend":
        return <Shield size={13} className="text-green-400" />;
      default:
        return <Dice5 size={13} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden select-none bg-[#0a0908]">
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-amber-900/40">
        <div className="flex items-center gap-3">
          <span className="text-amber-400/70 text-xs font-mono uppercase tracking-wider">
            Turn {currentTurn}
          </span>
          <div className="w-px h-4 bg-amber-900/40" />
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: PLAYER_COLORS[currentPlayer] }}
            />
            <span className="text-amber-200/80 text-sm font-semibold">
              {PLAYER_NAMES[currentPlayer]}&apos;s Turn
            </span>
          </div>
          <div className="w-px h-4 bg-amber-900/40" />
          <div className="flex items-center gap-1.5 bg-amber-700/20 border border-amber-500/30 rounded px-2.5 py-1">
            <Users size={14} className="text-amber-400" />
            <span className="text-amber-200 text-sm font-bold font-mono">
              {playerStats[currentPlayer].troops}
            </span>
            <span className="text-amber-400/60 text-[10px] uppercase tracking-wider">
              troops
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {PHASES.map((phase, i) => (
            <button
              key={phase}
              onClick={() => handlePhaseChange(phase)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all
                ${
                  currentPhase === phase
                    ? "bg-amber-600/30 text-amber-200 border border-amber-500/50 shadow-lg shadow-amber-900/30"
                    : i <= phaseIndex
                      ? "bg-white/5 text-amber-600/50 border border-transparent"
                      : "bg-white/5 text-white/25 border border-transparent"
                }`}
            >
              {phaseIcon(phase)}
              {phase}
            </button>
          ))}
        </div>

        <button
          onClick={nextPhase}
          className="w-36 px-5 py-1.5 bg-amber-700/50 hover:bg-amber-600/60 text-amber-100 rounded text-xs font-bold uppercase tracking-wide border border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-900/30"
        >
          {phaseIndex < PHASES.length - 1 ? "Next Phase" : "End Turn"} &rarr;
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-52 bg-black/40 border-r border-amber-900/30 flex flex-col">
          <div className="px-3 py-2 border-b border-amber-900/20">
            <h3 className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest">
              Players
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {playerStats.map((player, i) => (
              <div
                key={player.name}
                className={`rounded-lg p-2.5 transition-all ${
                  i === currentPlayer
                    ? "bg-amber-900/20 border border-amber-500/30"
                    : "bg-white/3 border border-transparent hover:bg-white/6"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full ring-1 ring-white/20"
                    style={{ backgroundColor: player.color }}
                  />
                  <span
                    className={`text-sm font-semibold ${i === currentPlayer ? "text-amber-200" : "text-white/60"}`}
                  >
                    {player.name}
                  </span>
                  {i === currentPlayer && (
                    <span className="ml-auto text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-bold">
                      TURN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/40 pl-5">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {player.territories}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {player.troops}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {currentPhase === "Deploy" && (
            <div className="p-3 border-t border-amber-900/20 bg-green-950/20">
              <div className="text-[10px] text-green-400/70 font-bold uppercase tracking-wider mb-1">
                Reinforcements
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-green-400/80" size={18} />
                <span className="text-green-300 text-xl font-bold font-mono">
                  {reinforcements}
                </span>
                <span className="text-green-400/50 text-[10px]">remaining</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden">
          <EuropeMap
            territories={MOCK_TERRITORIES}
            playerColors={PLAYER_COLORS}
            selectedTerritory={selectedTerritory}
            targetTerritory={targetTerritory}
            onTerritoryClick={handleTerritoryClick}
            validTargets={validTargets}
          />
        </div>

        <div className="w-56 bg-black/40 border-l border-amber-900/30 flex flex-col">
          <div className="border-b border-amber-900/20">
            <div className="px-3 py-2 border-b border-amber-900/20">
              <h3 className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest">
                Actions
              </h3>
            </div>
            <div className="p-3">
              {currentPhase === "Deploy" && (
                <div className="text-center text-xs text-amber-200/60 py-1">
                  <Users className="text-amber-400/50 mx-auto mb-2" size={24} />
                  Click your territory to deploy troops
                </div>
              )}
              {currentPhase === "Attack" && (
                <div className="space-y-2">
                  <div className="text-center text-xs text-red-300/60 py-1">
                    <Swords
                      className="text-red-400/50 mx-auto mb-2"
                      size={24}
                    />
                    {!selectedTerritory
                      ? "Select your territory to attack from"
                      : !targetTerritory
                        ? "Select an enemy neighbor to attack"
                        : "Ready to attack!"}
                  </div>
                  {selectedTerritory && targetTerritory && (
                    <div className="flex gap-1.5">
                      <button 
                      onClick={handleAttack}
                      className="flex-1 py-2 bg-red-900/30 hover:bg-red-800/40 text-red-300 rounded text-[11px] font-bold border border-red-500/30 transition-all flex items-center justify-center gap-1">
                        <Dice5 size={12} /> Roll
                      </button>
                      <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/40 rounded text-[11px] font-bold border border-white/10 transition-all">
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              )}
              {currentPhase === "Fortify" && (
                <div className="text-center text-xs text-blue-300/60 py-1">
                  <Shield className="text-blue-400/50 mx-auto mb-2" size={24} />
                  {!selectedTerritory
                    ? "Select territory to move troops from"
                    : !targetTerritory
                      ? "Select a connected friendly territory"
                      : "Choose troops to move"}
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-amber-900/20">
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
                      backgroundColor: PLAYER_COLORS[selectedInfo.owner],
                    }}
                  />
                  <span className="text-sm text-white/90 font-semibold">
                    {selectedTerritory}
                  </span>
                </div>
                <div className="flex gap-3 text-[11px] text-white/50">
                  <span>
                    Owner:{" "}
                    <span style={{ color: PLAYER_COLORS[selectedInfo.owner] }}>
                      {PLAYER_NAMES[selectedInfo.owner]}
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
                          backgroundColor: PLAYER_COLORS[targetInfo.owner],
                        }}
                      />
                      <span className="text-xs text-white/80">
                        {targetTerritory}
                      </span>
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

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-amber-900/20">
              <h3 className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest">
                Battle Log
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {MOCK_LOGS.map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-2 py-1.5 rounded bg-white/3 text-[11px] text-white/50"
                >
                  <span className="mt-0.5 shrink-0">{logIcon(log.icon)}</span>
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
