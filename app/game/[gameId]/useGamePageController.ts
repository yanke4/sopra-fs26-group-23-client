"use client";

import type {
  AttackAnimationData,
  DeployAnimationData,
  FortifyAnimationData,
  TerritoryState,
} from "@/components/europe-map";
import type { TroopSnapshot } from "@/components/victory-screen";
import { ApiService } from "@/api/apiService";
import { useGameSocket } from "@/hooks/useGameSocket";
import type { GamePhase, GameStateDTO, PlayerStateDTO } from "@/types/game";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ADJACENCY,
  COLOR_MAP,
  FALLBACK_TERRITORIES,
  NEUTRAL_COLOR,
  PHASES,
  PLAYER_COLORS,
  PLAYER_NAMES,
  REGIONS,
} from "./gameData";
import type { Phase } from "./gameData";
import {
  detectAttackFromDiff,
  detectDeployFromDiff,
  detectFortifyFromDiff,
} from "./animationDiffs";
import type { AttackDiffResult } from "./animationDiffs";

export const useGamePageController = () => {
  const params = useParams();
  const gameId = Number(params.gameId) || null;

  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(
    null,
  );
  const [inspectedTerritory, setInspectedTerritory] = useState<string | null>(
    null,
  );
  const [targetTerritory, setTargetTerritory] = useState<string | null>(null);
  const [deployTroops, setDeployTroops] = useState<number>(1);
  const [attackTroops, setAttackTroops] = useState<number>(1);
  const [fortifyTroops, setFortifyTroops] = useState<number>(1);

  const [surrenderMessage, setSurrenderMessage] = useState<string | null>(null);
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);
  const [showYourTurnToast, setShowYourTurnToast] = useState(false);
  const [showAttackPhaseToast, setShowAttackPhaseToast] = useState(false);
  const [showFortifyPhaseToast, setShowFortifyPhaseToast] = useState(false);
  const [turnTimeoutPopup, setTurnTimeoutPopup] = useState(false);
  const previousPlayersRef = useRef<PlayerStateDTO[]>([]);
  const previousStateRef = useRef<GameStateDTO | null>(null);
  const previousPhaseRef = useRef<string | null>(null);
  const [attackAnimation, setAttackAnimation] =
    useState<AttackAnimationData | null>(null);
  const attackAnimationIdRef = useRef(0);
  const pendingAttackRef = useRef<{
    attacker: string;
    defender: string;
    troopsSent: number;
    defenderTroopsBefore: number;
    defenderOwnerBefore: number | null;
  } | null>(null);
  const [fortifyAnimation, setFortifyAnimation] =
    useState<FortifyAnimationData | null>(null);
  const fortifyAnimationIdRef = useRef(0);
  const [deployAnimation, setDeployAnimation] =
    useState<DeployAnimationData | null>(null);
  const deployAnimationIdRef = useRef(0);

  const userId =
    typeof window !== "undefined"
      ? (() => {
          const stored = localStorage.getItem("user");
          return stored ? Number(JSON.parse(stored).id) : null;
        })()
      : null;

  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [troopHistory, setTroopHistory] = useState<TroopSnapshot[]>([]);

  const myPlayerId =
    gameState && userId !== null
      ? (gameState.players.find((p) => String(p.userId) === String(userId))
          ?.playerId ?? null)
      : null;

  const currentUser = useMemo(
    () => ({
      id: String(myPlayerId ?? "0"),
      name:
        gameState?.players.find((p) => p.userId === userId)?.username ??
        "Player",
      color: (
        gameState?.players.find((p) => p.userId === userId)?.color ?? "RED"
      ).toLowerCase(),
    }),
    [gameState, userId, myPlayerId],
  );

  useEffect(() => {
    if (!surrenderMessage) return;
    const timer = setTimeout(() => setSurrenderMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [surrenderMessage]);

  useEffect(() => {
    if (!isMyTurn) return;
    setShowYourTurnToast(true);
    const timer = setTimeout(() => setShowYourTurnToast(false), 2500);
    return () => clearTimeout(timer);
  }, [gameState?.currentPlayerId]);

  useEffect(() => {
    const currPhase = gameState?.currentPhase ?? null;
    const prevPhase = previousPhaseRef.current;

    if (prevPhase && currPhase && prevPhase !== currPhase && isMyTurn) {
      if (prevPhase === "DEPLOY" && currPhase === "ATTACK") {
        setShowAttackPhaseToast(true);
      } else if (prevPhase === "ATTACK" && currPhase === "FORTIFY") {
        setShowFortifyPhaseToast(true);
      }
    }

    previousPhaseRef.current = currPhase;
  }, [gameState?.currentPhase, gameState?.currentPlayerId]);

const handleGameUpdate = useCallback((state: GameStateDTO) => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const localUserId = stored ? Number(JSON.parse(stored).id) : null;
    const localPlayerId =
      localUserId != null
        ? (state.players.find((p) => Number(p.userId) === localUserId)
            ?.playerId ?? null)
        : null;

    if (state.timedOutPlayerId != null) {
      if (
        localPlayerId != null &&
        Number(state.timedOutPlayerId) === Number(localPlayerId)
      ) {
        setTurnTimeoutPopup(true);
      }
    }

    // Determine if an animation should be visible to this client
    const isVisibleForAnim = (fieldName: string) => {
      if (!state.fogOfWarEnabled || localPlayerId === null) return true;
      const myFields = state.fields.filter(f => f.ownerPlayerId === localPlayerId);
      if (myFields.some(f => f.fieldName === fieldName)) return true;
      for (const f of myFields) {
        if (ADJACENCY[f.fieldName]?.includes(fieldName)) return true;
      }
      return false;
    };

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

    const prevState = previousStateRef.current;
    if (prevState && prevState.currentPhase === "ATTACK") {
      let result: AttackDiffResult | null = state.lastAttack ?? null;
      if (result) {
        pendingAttackRef.current = null;
      }

      const pending = pendingAttackRef.current;
      if (!result && pending) {
        const defField = state.fields.find(
          (f) => f.fieldName === pending.defender,
        );
        const attField = state.fields.find(
          (f) => f.fieldName === pending.attacker,
        );
        if (defField && attField) {
          const conquered =
            defField.ownerPlayerId !== pending.defenderOwnerBefore;
          if (conquered) {
            const survivingAttackers = defField.troops;
            result = {
              attacker: pending.attacker,
              defender: pending.defender,
              attackerLosses: Math.max(
                0,
                pending.troopsSent - survivingAttackers,
              ),
              defenderLosses: pending.defenderTroopsBefore,
              conquered: true,
            };
          } else {
            result = {
              attacker: pending.attacker,
              defender: pending.defender,
              attackerLosses: pending.troopsSent,
              defenderLosses: Math.max(
                0,
                pending.defenderTroopsBefore - defField.troops,
              ),
              conquered: false,
            };
          }
          pendingAttackRef.current = null;
        }
      }

      if (!result) {
        result = detectAttackFromDiff(prevState, state);
      }

      if (result && (isVisibleForAnim(result.attacker) || isVisibleForAnim(result.defender))) {
        attackAnimationIdRef.current += 1;
        setAttackAnimation({ id: attackAnimationIdRef.current, ...result });
      }
    }

    if (prevState && prevState.currentPhase === "FORTIFY") {
      const fortifyResult = detectFortifyFromDiff(prevState, state);
      if (fortifyResult && (isVisibleForAnim(fortifyResult.from) || isVisibleForAnim(fortifyResult.to))) {
        fortifyAnimationIdRef.current += 1;
        setFortifyAnimation({
          id: fortifyAnimationIdRef.current,
          ...fortifyResult,
        });
      }
    }

    if (prevState && prevState.currentPhase === "DEPLOY") {
      const deployResult = detectDeployFromDiff(prevState, state);
      if (deployResult && isVisibleForAnim(deployResult.field)) {
        deployAnimationIdRef.current += 1;
        setDeployAnimation({
          id: deployAnimationIdRef.current,
          ...deployResult,
        });
      }
    }

    const isFirstSnapshot = !previousStateRef.current;
    const turnChanged =
      !!previousStateRef.current &&
      previousStateRef.current.turnNumber !== state.turnNumber;
    const justFinished =
      state.status === "FINISHED" &&
      previousStateRef.current?.status !== "FINISHED";

    if (isFirstSnapshot || turnChanged || justFinished) {
      const totalTroopsByPlayer: Record<number, number> = {};
      state.players.forEach((p) => {
        totalTroopsByPlayer[p.playerId] = state.fields
          .filter((f) => f.ownerPlayerId === p.playerId)
          .reduce((sum, f) => sum + f.troops, 0);
      });
      setTroopHistory((prev) => {
        const lastTurn = prev.length > 0 ? prev[prev.length - 1].turn : -1;
        const snapshotTurn =
          justFinished && state.turnNumber <= lastTurn
            ? lastTurn + 1
            : state.turnNumber;
        const snapshot: TroopSnapshot = {
          turn: snapshotTurn,
          troops: totalTroopsByPlayer,
        };
        if (
          !justFinished &&
          prev.length > 0 &&
          prev[prev.length - 1].turn === snapshotTurn
        ) {
          return [...prev.slice(0, -1), snapshot];
        }
        return [...prev, snapshot];
      });
    }

    previousStateRef.current = state;

    setGameState(state);
  }, []);

  useEffect(() => {
    if (!attackAnimation) return;
    const timer = setTimeout(() => setAttackAnimation(null), 2200);
    return () => clearTimeout(timer);
  }, [attackAnimation]);

  useEffect(() => {
    if (!fortifyAnimation) return;
    const timer = setTimeout(() => setFortifyAnimation(null), 2100);
    return () => clearTimeout(timer);
  }, [fortifyAnimation]);

  useEffect(() => {
    if (!deployAnimation) return;
    const timer = setTimeout(() => setDeployAnimation(null), 2100);
    return () => clearTimeout(timer);
  }, [deployAnimation]);

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
        previousStateRef.current = state;
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

  const currentTurn = gameState?.turnNumber ?? 1;

  const phaseIndex = PHASES.indexOf(currentPhase);

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
          isSelf: p.userId === userId,
          missionStatus: p.missionStatus ?? null,
          missionBonusTroops: p.missionBonusTroops ?? 0,
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
        isSelf: false,
        missionStatus: null,
        missionBonusTroops: 0,
      };
    });
  }, [gameState, userId]);

  const currentPlayer = gameState
    ? playerStats.findIndex((p) => p.playerId === gameState.currentPlayerId)
    : 0;

const { territories, mapColors } = useMemo(() => {
    if (!gameState) {
      return { territories: FALLBACK_TERRITORIES, mapColors: PLAYER_COLORS };
    }
    const playerIdToIndex: Record<number, number> = {};
    gameState.players.forEach((p, i) => {
      playerIdToIndex[p.playerId] = i;
    });
    
    const neutralIndex = gameState.players.length;
    const fogIndex = gameState.players.length + 1; // Create an index for hidden territories

    // Fog of war logic -> Determine visible fields
    const visibleFields = new Set<string>();
    if (gameState.fogOfWarEnabled && myPlayerId !== null) {
      for (const f of gameState.fields) {
        if (f.ownerPlayerId === myPlayerId) {
          visibleFields.add(f.fieldName);
          for (const neighbor of ADJACENCY[f.fieldName] || []) {
            visibleFields.add(neighbor);
          }
        }
      }
    }

    const terr: Record<string, TerritoryState> = {};
    for (const f of gameState.fields) {
      const isVisible = !gameState.fogOfWarEnabled || myPlayerId === null || visibleFields.has(f.fieldName);
      
      terr[f.fieldName] = {
        owner: isVisible
          ? (f.ownerPlayerId != null
              ? (playerIdToIndex[f.ownerPlayerId] ?? neutralIndex)
              : neutralIndex)
          : fogIndex, // Assign the dark gray fogIndex instead of the standard neutralIndex
        troops: isVisible ? f.troops : 0,
        visible: isVisible,
      };
    }
    
    // Fog of war Color #222222
    const colors = [...playerStats.map((p) => p.color), NEUTRAL_COLOR, "#222222"];
    
    return { territories: terr, mapColors: colors };
  }, [gameState, playerStats, myPlayerId]);

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

  const myMission = useMemo(() => {
    if (!gameState || myPlayerId === null) return null;
    const me = gameState.players.find((p) => p.playerId === myPlayerId);
    if (!me || !me.missionType) return null;
    return {
      type: me.missionType,
      description: me.missionDescription ?? "",
      status: me.missionStatus ?? "LOCKED",
      startRound: me.missionStartRound ?? 3,
      expiresAtRound: me.missionExpiresAtRound ?? 6,
      bonusTroops: me.missionBonusTroops ?? 0,
    };
  }, [gameState, myPlayerId]);

  const selectedFieldOwnerPlayerId =
    selectedTerritory && gameState
      ? (gameState.fields.find((f) => f.fieldName === selectedTerritory)
          ?.ownerPlayerId ?? null)
      : null;

  const reinforcements = useMemo(() => {
    if (currentPhase !== "Deploy" || !isMyTurn || !gameState) return 0;
    const me = gameState.players.find((p) => p.playerId === myPlayerId);
    return me?.troopCount ?? 0;
  }, [currentPhase, isMyTurn, gameState, myPlayerId]);

  const canDeployToSelected =
    currentPhase === "Deploy" &&
    isMyTurn &&
    reinforcements > 0 &&
    !!selectedTerritory &&
    selectedFieldOwnerPlayerId === myPlayerId;

  useEffect(() => {
    if (currentPhase === "Deploy" && isMyTurn) {
      setDeployTroops(1);
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
    const reachable = new Set<string>();
    const visited = new Set<string>([selectedTerritory]);
    const queue: string[] = [selectedTerritory];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbor of ADJACENCY[current] || []) {
        if (!visited.has(neighbor) && territories[neighbor]?.owner === selectedOwner) {
          visited.add(neighbor);
          reachable.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return Array.from(reachable);
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

  const canFortifySelectedTarget = hasFortifySelection && maxFortifyTroops > 0;

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

    setInspectedTerritory(name);

    if (!isMyTurn) {
      setSelectedTerritory(null);
      setTargetTerritory(null);
      return;
    }

    if (currentPhase === "Attack" || currentPhase === "Fortify") {
      const isMine = territory.owner === myOwnerIndex;

      if (!selectedTerritory) {
        if (!isMine) return;
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

    const defenderField = gameState?.fields.find(
      (f) => f.fieldName === targetTerritory,
    );
    pendingAttackRef.current = {
      attacker: selectedTerritory,
      defender: targetTerritory,
      troopsSent: troops,
      defenderTroopsBefore: defenderField?.troops ?? 0,
      defenderOwnerBefore: defenderField?.ownerPlayerId ?? null,
    };

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
      pendingAttackRef.current = null;
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

      setDeployTroops(1);
    } catch (e) {
      console.error("Deploy failed:", e);
    }
  };

  const handleSurrender = () => {
    if (!gameId || !myPlayerId) return;
    setShowSurrenderModal(true);
  };

  const handleConfirmSurrender = async () => {
    setShowSurrenderModal(false);
    try {
      const apiService = new ApiService();
      await apiService.post(
        `/games/${gameId}/players/${myPlayerId}/surrender`,
        {},
      );
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

  const inspectedInfo = inspectedTerritory
    ? territories[inspectedTerritory]
    : null;
  const targetInfo = targetTerritory ? territories[targetTerritory] : null;

  return {
    gameId,
    selectedTerritory,
    inspectedTerritory,
    targetTerritory,
    deployTroops,
    setDeployTroops,
    attackTroops,
    setAttackTroops,
    fortifyTroops,
    setFortifyTroops,
    surrenderMessage,
    showSurrenderModal,
    setShowSurrenderModal,
    turnTimeoutPopup,
    setTurnTimeoutPopup,
    attackAnimation,
    fortifyAnimation,
    deployAnimation,
    userId,
    gameState,
    troopHistory,
    myPlayerId,
    currentUser,
    currentPhase,
    isMyTurn,
    currentTurn,
    phaseIndex,
    playerStats,
    currentPlayer,
    territories,
    mapColors,
    myRegionBonus,
    myOwnedRegions,
    myMission,
    reinforcements,
    canDeployToSelected,
    validTargets,
    maxAttackTroops,
    maxFortifyTroops,
    hasAttackSelection,
    canAttackSelectedTarget,
    hasFortifySelection,
    canFortifySelectedTarget,
    inspectedInfo,
    targetInfo,
    handleTerritoryClick,
    handleDeploy,
    handleAttack,
    handleFortify,
    handleSurrender,
    handleConfirmSurrender,
    nextPhase,
    showYourTurnToast,
    showAttackPhaseToast,
    showFortifyPhaseToast,
  };
};

export type GamePageController = ReturnType<typeof useGamePageController>;
