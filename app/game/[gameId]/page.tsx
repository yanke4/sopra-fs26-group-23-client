"use client";

import EuropeMap, { TerritoryState } from "@/components/europe-map";
import VictoryScreen from "@/components/victory-screen";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Swords, Shield, Flag, Dice5, Users, MapPin } from "lucide-react";
import { ApiService } from "@/api/apiService";
import { useGameSocket } from "@/hooks/useGameSocket";
import type { GameStateDTO, GamePhase } from "@/types/game";
import type { AttackPayload } from "@/types/game";
import GameChat from "@/components/GameChat";
import { useParams } from "next/navigation";
import {
  PHASES,
  PLAYER_COLORS,
  PLAYER_NAMES,
  COLOR_MAP,
  NEUTRAL_COLOR,
  ADJACENCY,
  FALLBACK_TERRITORIES,
  MOCK_LOGS,
} from "./gameData";
import type { Phase } from "./gameData";

const GamePage = () => {
  const params = useParams();
  const gameId = Number(params.gameId) || null;

  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(
    null,
  );
  const [targetTerritory, setTargetTerritory] = useState<string | null>(null);
  const [deployTroops, setDeployTroops] = useState<number>(1);
  const [reinforcements, setReinforcements] = useState<number>(0);

  const userId =
    typeof window !== "undefined"
      ? (() => {
          const stored = localStorage.getItem("user");
          return stored ? Number(JSON.parse(stored).id) : null;
        })()
      : null;

  const [gameState, setGameState] = useState<GameStateDTO | null>(null);

  const myPlayerId =
    gameState && userId !== null
      ? (gameState.players.find((p) => String(p.userId) === String(userId))
          ?.playerId ?? null)
      : null;

  // not currentPlayer so whos turn it is instead currentUser so Person in Chat
  const currentUser = useMemo(() => ({
    id: String(myPlayerId ?? "0"), 
    name: gameState?.players.find(p => p.userId === userId)?.username ?? "Player", 
    color: (gameState?.players.find(p => p.userId === userId)?.color ?? "RED").toLowerCase(),
  }), [gameState, userId, myPlayerId]);
      


  const handleGameUpdate = useCallback((state: GameStateDTO) => {
    setGameState(state);
  }, []);

  useGameSocket({ gameId, onGameUpdate: handleGameUpdate });

  useEffect(() => {
    if (gameId === null) return;
    const apiService = new ApiService();
    apiService
      .get<GameStateDTO>(`/games/${gameId}`)
      .then((state) => {
        console.log(
          "Game state players:",
          JSON.stringify(state.players, null, 2),
        );
        console.log(
          "Game state fields:",
          JSON.stringify(state.fields, null, 2),
        );
        setGameState(state);
      })
      .catch((err) =>
        console.error("Failed to fetch initial game state:", err),
      );
  }, [gameId]);

  const PHASE_MAP: Record<GamePhase, Phase> = {
    DEPLOY: "Deploy",
    ATTACK: "Attack",
    FORTIFY: "Fortify",
  };

  const currentPhase: Phase = gameState
    ? (PHASE_MAP[gameState.currentPhase] ?? "Deploy")
    : "Deploy";

  const isMyTurn = gameState ? gameState.currentPlayerId === myPlayerId : false;

  const currentTurn = 3;



  const phaseIndex = PHASES.indexOf(currentPhase);

  // Compute player stats from game state (real players) or fallback to mock
  const playerStats = useMemo(() => {
    if (gameState) {
      return gameState.players.map((p) => {
        const ownedFields = gameState.fields.filter(
          (f) => f.ownerPlayerId === p.playerId,
        );
        return {
          name: p.userId === userId ? "You" : p.username,
          color: COLOR_MAP[p.color] ?? PLAYER_COLORS[0],
          territories: ownedFields.length,
          troops: ownedFields.reduce((sum, f) => sum + f.troops, 0),
          playerId: p.playerId,
        };
      });
    }
    return PLAYER_NAMES.map((name, i) => {
      const owned = Object.values(FALLBACK_TERRITORIES).filter(
        (t) => t.owner === i,
      );
      return {
        name,
        color: PLAYER_COLORS[i],
        territories: owned.length,
        troops: owned.reduce((sum, t) => sum + t.troops, 0),
        playerId: i,
      };
    });
  }, [gameState, userId]);

  const currentPlayer = gameState
    ? playerStats.findIndex((p) => p.playerId === gameState.currentPlayerId)
    : 0;

  // Build territories + colors from real game state, fallback to mock
  const { territories, mapColors } = useMemo(() => {
    if (!gameState) {
      return { territories: FALLBACK_TERRITORIES, mapColors: PLAYER_COLORS };
    }
    const playerIdToIndex: Record<number, number> = {};
    gameState.players.forEach((p, i) => {
      playerIdToIndex[p.playerId] = i;
    });
    const neutralIndex = gameState.players.length;

    const terr: Record<string, TerritoryState> = {};
    for (const f of gameState.fields) {
      terr[f.fieldName] = {
        owner:
          f.ownerPlayerId != null
            ? (playerIdToIndex[f.ownerPlayerId] ?? neutralIndex)
            : neutralIndex,
        troops: f.troops,
      };
    }
    const colors = [...playerStats.map((p) => p.color), NEUTRAL_COLOR];
    return { territories: terr, mapColors: colors };
  }, [gameState, playerStats]);

  const myOwnerIndex = gameState
    ? playerStats.findIndex((p) => p.playerId === myPlayerId)
    : 0;

  const selectedFieldOwnerPlayerId =
    selectedTerritory && gameState
      ? (gameState.fields.find((f) => f.fieldName === selectedTerritory)
          ?.ownerPlayerId ?? null)
      : null;

  const canDeployToSelected =
    currentPhase === "Deploy" &&
    isMyTurn &&
    reinforcements > 0 &&
    !!selectedTerritory &&
    selectedFieldOwnerPlayerId === myPlayerId;

  useEffect(() => {
    // Only the active player gets deploy troops
    if (currentPhase === "Deploy" && isMyTurn) {
      setReinforcements(5);
      setDeployTroops(1);
    } else {
      setReinforcements(0);
    }
  }, [currentPhase, isMyTurn, gameState?.currentPlayerId]);

  const validTargets = useMemo(() => {
    if (!selectedTerritory) return [];
    const selectedOwner = territories[selectedTerritory]?.owner;

    if (selectedOwner !== myOwnerIndex) return [];

    const neighbors = ADJACENCY[selectedTerritory] || [];

    if (currentPhase === "Attack") {
      return neighbors.filter((n) => territories[n]?.owner !== selectedOwner);
    }
    if (currentPhase === "Fortify") {
      return neighbors.filter((n) => territories[n]?.owner === selectedOwner);
    }
    return [];
  }, [selectedTerritory, currentPhase, territories, myOwnerIndex]);

  const handleTerritoryClick = (name: string) => {
    const territory = territories[name];
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

  const advancePhase = async () => {
    if (gameId === null || myPlayerId === null || !isMyTurn) return;
    try {
      const apiService = new ApiService();
      await apiService.post(`/games/${gameId}/turns/advance-phase`, {
        playerId: myPlayerId,
      });
      setSelectedTerritory(null);
      setTargetTerritory(null);
    } catch (e) {
      console.error("Failed to advance phase:", e);
    }
  };

  const handleAttack = async () => {
    if (
      !selectedTerritory ||
      !targetTerritory ||
      gameId === null ||
      myPlayerId === null
    )
      return;
    try {
      const apiService = new ApiService();
      await apiService.post(`/games/${gameId}/turns/attack`, {
        playerId: myPlayerId,
        attacks: [
          {
            attackingField: selectedTerritory,
            troops: territories[selectedTerritory]?.troops ?? 1,
            defendingField: targetTerritory,
          },
        ],
      });
      setSelectedTerritory(null);
      setTargetTerritory(null);
    } catch (e) {
      console.error("Attack failed:", e);
    }
  };

  const handleDeploy = async () => {
    if (
      !canDeployToSelected ||
      gameId === null ||
      myPlayerId === null ||
      !selectedTerritory ||
      reinforcements <= 0
    ) {
      return;
    }

    const troops = Math.min(Math.max(1, deployTroops || 1), reinforcements);
    if (troops <= 0) return;

    try {
      const apiService = new ApiService();
      await apiService.post(`/games/${gameId}/turns/deploy`, {
        playerId: myPlayerId,
        deployments: [{ fieldName: selectedTerritory, troops }],
      });

      setReinforcements((prev) => Math.max(0, prev - troops));
      setDeployTroops(1);
    } catch (e) {
      console.error("Deploy failed:", e);
    }
  };

  const handleSurrender = async () => {
  if (!gameId || !myPlayerId) return;
  const confirmed = window.confirm("Are you sure you want to surrender?");
  if (!confirmed) return;
  try {
    const apiService = new ApiService();
    await apiService.post(`/games/${gameId}/players/${myPlayerId}/surrender`, {});
  } catch (e) {
    console.error("Surrender failed:", e);
  }
};

  const nextPhase = () => {
    advancePhase();
  };

  const selectedInfo = selectedTerritory
    ? territories[selectedTerritory]
    : null;
  const targetInfo = targetTerritory ? territories[targetTerritory] : null;

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

        <div className="flex items-center gap-1">
          {PHASES.map((phase, i) => (
            <div
              key={phase}
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
            </div>
          ))}
        </div>

        <button
          onClick={nextPhase}
          disabled={!isMyTurn}
          className={`w-36 px-5 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-all ${
            isMyTurn
              ? "bg-amber-700/50 hover:bg-amber-600/60 text-amber-100 border-amber-500/30 hover:shadow-lg hover:shadow-amber-900/30 cursor-pointer"
              : "bg-white/5 text-white/20 border-white/10 cursor-not-allowed"
          }`}
        >
          {phaseIndex < PHASES.length - 1 ? "Next Phase" : "End Turn"} &rarr;
        </button>

        <button
          onClick={handleSurrender}
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

          {/* deploy panel only during your deploy phase */}
          {currentPhase === "Deploy" && isMyTurn && (
            <div className="p-3 border-t border-amber-900/20 bg-green-950/20 space-y-2">
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

              {canDeployToSelected && (
                <div className="pt-2 mt-2 border-t border-green-800/40 space-y-2">
                  <div className="text-[10px] text-green-400/70 font-bold uppercase tracking-wider">
                    Deploy to
                  </div>
                  <div className="text-sm text-green-200 font-semibold truncate">
                    {selectedTerritory}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setDeployTroops((v) => Math.max(1, (v || 1) - 1))
                      }
                      className="w-7 h-7 rounded bg-green-900/30 hover:bg-green-800/40 border border-green-500/30 text-green-200 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, reinforcements)}
                      value={deployTroops}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        if (Number.isNaN(next)) {
                          setDeployTroops(1);
                          return;
                        }
                        setDeployTroops(
                          Math.max(1, Math.min(next, Math.max(1, reinforcements))),
                        );
                      }}
                      className="w-full h-7 px-2 rounded bg-black/30 border border-green-500/30 text-green-100 text-sm font-mono"
                    />
                    <button
                      onClick={() =>
                        setDeployTroops((v) =>
                          Math.min(Math.max(1, reinforcements), (v || 1) + 1),
                        )
                      }
                      className="w-7 h-7 rounded bg-green-900/30 hover:bg-green-800/40 border border-green-500/30 text-green-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleDeploy}
                    disabled={!isMyTurn || reinforcements <= 0}
                    className={`w-full py-1.5 rounded text-[11px] font-bold border transition-all ${
                      isMyTurn && reinforcements > 0
                        ? "bg-green-900/40 hover:bg-green-800/50 text-green-200 border-green-500/30"
                        : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                    }`}
                  >
                    Deploy troops
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden">
          <EuropeMap
            territories={territories}
            playerColors={mapColors}
            selectedTerritory={selectedTerritory}
            targetTerritory={targetTerritory}
            onTerritoryClick={handleTerritoryClick}
            validTargets={validTargets}
          />
        </div>

        <div className="w-56 bg-black/40 border-l border-amber-900/30 flex flex-col">
          <div className="border-b border-amber-900/20">
            <div className="p-3">
              {currentPhase === "Attack" && (
                <div className="space-y-2">
                  {selectedTerritory && targetTerritory && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleAttack}
                        className="flex-1 py-2 bg-red-900/30 hover:bg-red-800/40 text-red-300 rounded text-[11px] font-bold border border-red-500/30 transition-all flex items-center justify-center gap-1"
                      >
                        <Dice5 size={12} /> Roll
                      </button>
                      <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/40 rounded text-[11px] font-bold border border-white/10 transition-all">
                        Skip
                      </button>
                    </div>
                  )}
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
            <div className="h-64 border-t border-amber-900/30">
            {myPlayerId &&(
              <GameChat
                key={gameId} // Reset chat when gameId changes, but not on every render
                gameId={String(gameId ?? "0")}
                currentUser={currentUser}
                apiUrl={process.env.NEXT_PUBLIC_PROD_API_URL ?? "http://localhost:8080"}
            />)}
          </div>
            </div>
          </div>
        </div>
      </div>

      {gameState?.status === "FINISHED" && (
        <VictoryScreen gameState={gameState} currentUserId={userId} />
      )}
    </div>
  );
};

export default GamePage;
