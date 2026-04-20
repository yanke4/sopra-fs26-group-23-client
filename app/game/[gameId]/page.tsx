"use client";

import EuropeMap, { TerritoryState } from "@/components/europe-map";
import VictoryScreen from "@/components/victory-screen";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Swords, Shield, Users, MapPin, Flag, Dice5 } from "lucide-react";
import { ApiService } from "@/api/apiService";
import { useGameSocket } from "@/hooks/useGameSocket";
import type { GameStateDTO, GamePhase, PlayerStateDTO } from "@/types/game";
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
  REGIONS,
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
  const [attackTroops, setAttackTroops] = useState<number>(1);
  const [fortifyTroops, setFortifyTroops] = useState<number>(1);

  const [surrenderMessage, setSurrenderMessage] = useState<string | null>(null);
  const previousPlayersRef = useRef<PlayerStateDTO[]>([]);

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


  const currentUser = useMemo(() => ({
    id: String(myPlayerId ?? "0"), 
    name: gameState?.players.find(p => p.userId === userId)?.username ?? "Player", 
    color: (gameState?.players.find(p => p.userId === userId)?.color ?? "RED").toLowerCase(),
  }), [gameState, userId, myPlayerId]);


  useEffect(() => {
    if (!surrenderMessage) return;
    const timer = setTimeout(() => setSurrenderMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [surrenderMessage]);


  const handleGameUpdate = useCallback((state: GameStateDTO) => {
    const prev = previousPlayersRef.current;
    if (prev.length > 0) {
      const surrendered = state.players.filter((p) => {
        const old = prev.find((op) => op.playerId === p.playerId);
        return old?.alive === true && p.alive === false;
      });
      if (surrendered.length > 0) {
        setSurrenderMessage(`${surrendered[0].username} has surrendered!`);
      }
    }
    previousPlayersRef.current = state.players;

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
        previousPlayersRef.current = state.players;
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
          alive: p.alive,
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
        alive: true,
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

  const myRegionBonus = useMemo(() => {
    return REGIONS.filter((region) =>
      region.fields.every((f) => territories[f]?.owner === myOwnerIndex),
    ).reduce((sum, r) => sum + r.bonus, 0);
  }, [territories, myOwnerIndex]);

  const myOwnedRegions = useMemo(() => {
    return REGIONS.filter((region) =>
      region.fields.every((f) => territories[f]?.owner === myOwnerIndex),
    );
  }, [territories, myOwnerIndex]);

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
    if (currentPhase === "Deploy" && isMyTurn) {
      setReinforcements(5 + myRegionBonus);
      setDeployTroops(1);
    } else {
      setReinforcements(0);
    }
  }, [currentPhase, isMyTurn, gameState?.currentPlayerId, myRegionBonus]);

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

  const selectedOwnerIndex = selectedTerritory
    ? (territories[selectedTerritory]?.owner ?? null)
    : null;
  const targetOwnerIndex = targetTerritory
    ? (territories[targetTerritory]?.owner ?? null)
    : null;

  const selectedTroops = selectedTerritory
    ? (territories[selectedTerritory]?.troops ?? 0)
    : 0;
  const maxAttackTroops = Math.max(0, selectedTroops - 1);
  const maxFortifyTroops = Math.max(0, selectedTroops - 1);

  const hasAttackSelection =
    currentPhase === "Attack" &&
    isMyTurn &&
    !!selectedTerritory &&
    !!targetTerritory &&
    selectedOwnerIndex === myOwnerIndex &&
    targetOwnerIndex !== null &&
    targetOwnerIndex !== myOwnerIndex;

  const canAttackSelectedTarget = hasAttackSelection && maxAttackTroops > 0;

  const hasFortifySelection =
    currentPhase === "Fortify" &&
    isMyTurn &&
    !!selectedTerritory &&
    !!targetTerritory &&
    selectedOwnerIndex === myOwnerIndex &&
    targetOwnerIndex === myOwnerIndex;

  const canFortifySelectedTarget =
    hasFortifySelection && maxFortifyTroops > 0;

  useEffect(() => {
    if (currentPhase !== "Attack") {
      setAttackTroops(1);
      return;
    }

    setAttackTroops((prev) => {
      const max = Math.max(1, maxAttackTroops);
      return Math.max(1, Math.min(prev || 1, max));
    });
  }, [currentPhase, maxAttackTroops, selectedTerritory, targetTerritory]);

  useEffect(() => {
    if (currentPhase !== "Fortify") {
      setFortifyTroops(1);
      return;
    }

    setFortifyTroops((prev) => {
      const max = Math.max(1, maxFortifyTroops);
      return Math.max(1, Math.min(prev || 1, max));
    });
  }, [currentPhase, maxFortifyTroops, selectedTerritory, targetTerritory]);

  const handleTerritoryClick = (name: string) => {
    const territory = territories[name];
    if (!territory) return;

    if (currentPhase === "Attack" || currentPhase === "Fortify") {
      const isMine = territory.owner === myOwnerIndex;

      if (!selectedTerritory) {
        if (!isMine) return; // source must be yours
        setSelectedTerritory(name);
        setTargetTerritory(null);
        return;
      }

      if (name === selectedTerritory) {
        setSelectedTerritory(null);
        setTargetTerritory(null);
        return;
      }

      if (validTargets.includes(name)) {
        setTargetTerritory(name);
        return;
      }

      if (isMine) {
        setSelectedTerritory(name);
      }
      setTargetTerritory(null);
      return;
    }

    setSelectedTerritory(name === selectedTerritory ? null : name);
    setTargetTerritory(null);
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
      !canAttackSelectedTarget ||
      !selectedTerritory ||
      !targetTerritory ||
      gameId === null ||
      myPlayerId === null
    ) {
      return;
    }

    const troops = Math.min(Math.max(1, attackTroops || 1), maxAttackTroops);

    try {
      const apiService = new ApiService();
      await apiService.post(`/games/${gameId}/turns/attack`, {
        playerId: myPlayerId,
        attacks: [
          {
            attackingField: selectedTerritory,
            troops,
            defendingField: targetTerritory,
          },
        ],
      });

      setSelectedTerritory(null);
      setTargetTerritory(null);
      setAttackTroops(1);
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

      const newReinforcements = Math.max(0, reinforcements - troops);
      setReinforcements(newReinforcements);
      setDeployTroops(1);
      if (newReinforcements === 0) {
        advancePhase();
      }
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
      setSurrenderMessage("You have surrendered.");
    } catch (e) {
      console.error("Surrender failed:", e);
    }
  };

  const handleFortify = async () => {
    if (
      !canFortifySelectedTarget ||
      !selectedTerritory ||
      !targetTerritory ||
      gameId === null ||
      myPlayerId === null
    ) {
      return;
    }

    const troops = Math.min(Math.max(1, fortifyTroops || 1), maxFortifyTroops);

    try {
      const apiService = new ApiService();

      // backend endpoint for fortify/move
      await apiService.post(`/games/${gameId}/turns/move`, {
        playerId: myPlayerId,
        moves: [
          {
            fromField: selectedTerritory,
            toField: targetTerritory,
            troops,
          },
        ],
      });

      // ensure UI is updated even if socket is delayed
      const freshState = await apiService.get<GameStateDTO>(`/games/${gameId}`);
      setGameState(freshState);

      setSelectedTerritory(null);
      setTargetTerritory(null);
      setFortifyTroops(1);
      advancePhase();
    } catch (e) {
      console.error("Move/Fortify failed:", e);
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

      
      {surrenderMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-900/90 border border-red-500/50 text-red-100 px-5 py-2.5 rounded-lg shadow-xl shadow-black/50 text-sm font-semibold">
          <Flag size={14} className="text-red-400 shrink-0" />
          {surrenderMessage}
        </div>
      )}

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

        <div className="flex items-center gap-2">
          <button
            onClick={nextPhase}
            disabled={!isMyTurn || (currentPhase === "Deploy" && reinforcements > 0)}
            className={`w-36 px-5 py-1.5 rounded text-xs font-bold uppercase tracking-wide border transition-all ${
              isMyTurn && !(currentPhase === "Deploy" && reinforcements > 0)
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
                  !player.alive
                    ? "opacity-40 bg-white/3 border border-transparent"
                    : i === currentPlayer
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
                    className={`text-sm font-semibold ${
                      !player.alive
                        ? "text-white/30 line-through"
                        : i === currentPlayer
                          ? "text-amber-200"
                          : "text-white/60"
                    }`}
                  >
                    {player.name}
                  </span>
                  {i === currentPlayer && player.alive && (
                    <span className="ml-auto text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-bold">
                      TURN
                    </span>
                  )}
                  {!player.alive && (
                    <span className="ml-auto text-[9px] text-red-400/60 bg-red-400/10 px-1.5 py-0.5 rounded font-bold">
                      OUT
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

          {/* region bonus panel */}
          <div className="p-3 border-t border-amber-900/20 space-y-1.5">
            <div className="text-[10px] text-amber-400/70 font-bold uppercase tracking-wider">
              Your Region Bonus
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-lg font-bold font-mono">
                +{myRegionBonus}
              </span>
              <span className="text-amber-400/50 text-[10px]">troops / round</span>
            </div>
            {myOwnedRegions.length > 0 ? (
              <div className="space-y-1">
                {myOwnedRegions.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-200/60">{r.name}</span>
                    <span className="text-amber-300/80 font-mono">+{r.bonus}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-white/25 italic">No regions controlled</div>
            )}
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
          {/* attack panel only during your attack phase */}
          {currentPhase === "Attack" && isMyTurn && hasAttackSelection && (
            <div className="p-3 border-t border-amber-900/20 bg-red-950/20 space-y-2">
              <div className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider mb-1">
                Attack
              </div>

              <div className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider">
                From
              </div>
              <div className="text-sm text-red-200 font-semibold truncate">
                {selectedTerritory}
              </div>

              <div className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider">
                Target
              </div>
              <div className="text-sm text-red-200 font-semibold truncate">
                {targetTerritory}
              </div>

              <div className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider pt-1">
                Attack troops
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setAttackTroops((v) => Math.max(1, (v || 1) - 1))
                  }
                  className="w-7 h-7 rounded bg-red-900/30 hover:bg-red-800/40 border border-red-500/30 text-red-200 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, maxAttackTroops)}
                  value={attackTroops}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isNaN(next)) {
                      setAttackTroops(1);
                      return;
                    }
                    setAttackTroops(
                      Math.max(1, Math.min(next, Math.max(1, maxAttackTroops))),
                    );
                  }}
                  className="w-full h-7 px-2 rounded bg-black/30 border border-red-500/30 text-red-100 text-sm font-mono"
                />
                <button
                  onClick={() =>
                    setAttackTroops((v) =>
                      Math.min(Math.max(1, maxAttackTroops), (v || 1) + 1),
                    )
                  }
                  className="w-7 h-7 rounded bg-red-900/30 hover:bg-red-800/40 border border-red-500/30 text-red-200 font-bold"
                >
                  +
                </button>
              </div>

              <div className="text-[10px] text-red-300/60">
                Max available: {maxAttackTroops}
              </div>

              <button
                onClick={handleAttack}
                disabled={!canAttackSelectedTarget}
                className={`w-full py-1.5 rounded text-[11px] font-bold border transition-all ${
                  canAttackSelectedTarget
                    ? "bg-red-900/40 hover:bg-red-800/50 text-red-200 border-red-500/30"
                    : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                }`}
              >
                Attack
              </button>
            </div>
          )}

          {currentPhase === "Fortify" && isMyTurn && hasFortifySelection && (
            <div className="p-3 border-t border-amber-900/20 bg-blue-950/20 space-y-2">
              <div className="text-[10px] text-blue-400/70 font-bold uppercase tracking-wider mb-1">
                Reinforce
              </div>

              <div className="text-[10px] text-blue-400/70 font-bold uppercase tracking-wider">
                Move
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm text-blue-200 font-semibold">
                <span className="truncate">{selectedTerritory}</span>
                <span className="text-blue-300/70">→</span>
                <span className="truncate">{targetTerritory}</span>
              </div>

              <div className="text-[10px] text-blue-400/70 font-bold uppercase tracking-wider pt-1">
                Troops to move
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFortifyTroops((v) => Math.max(1, (v || 1) - 1))}
                  className="w-7 h-7 rounded bg-blue-900/30 hover:bg-blue-800/40 border border-blue-500/30 text-blue-200 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, maxFortifyTroops)}
                  value={fortifyTroops}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isNaN(next)) {
                      setFortifyTroops(1);
                      return;
                    }
                    setFortifyTroops(
                      Math.max(1, Math.min(next, Math.max(1, maxFortifyTroops))),
                    );
                  }}
                  className="w-full h-7 px-2 rounded bg-black/30 border border-blue-500/30 text-blue-100 text-sm font-mono"
                />
                <button
                  onClick={() =>
                    setFortifyTroops((v) =>
                      Math.min(Math.max(1, maxFortifyTroops), (v || 1) + 1),
                    )
                  }
                  className="w-7 h-7 rounded bg-blue-900/30 hover:bg-blue-800/40 border border-blue-500/30 text-blue-200 font-bold"
                >
                  +
                </button>
              </div>

              <div className="text-[10px] text-blue-300/60">
                Max available: {maxFortifyTroops}
              </div>

              <button
                onClick={handleFortify}
                disabled={!canFortifySelectedTarget}
                className={`w-full py-1.5 rounded text-[11px] font-bold border transition-all ${
                  canFortifySelectedTarget
                    ? "bg-blue-900/40 hover:bg-blue-800/50 text-blue-200 border-blue-500/30"
                    : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                }`}
              >
                Move troops
              </button>
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