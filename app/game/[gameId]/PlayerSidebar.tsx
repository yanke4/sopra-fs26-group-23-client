"use client";

import {
  Check,
  Lock,
  MapPin,
  MousePointerClick,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Phase } from "./gameData";
import type { GamePageController } from "./useGamePageController";

const PHASE_HINTS: Record<
  Phase,
  { tone: "green" | "red" | "blue"; icon: typeof Users; label: string; message: string }
> = {
  Deploy: {
    tone: "green",
    icon: Users,
    label: "Deploy phase",
    message: "Click one of your territories to place reinforcements.",
  },
  Attack: {
    tone: "red",
    icon: Swords,
    label: "Attack phase",
    message: "Click an owned territory with 2+ troops to launch an attack.",
  },
  Fortify: {
    tone: "blue",
    icon: Shield,
    label: "Fortify phase",
    message: "Click a territory to move troops to a connected friendly land.",
  },
};

const TONE_CLASSES: Record<
  "green" | "red" | "blue",
  { bg: string; border: string; text: string; muted: string; pulse: string }
> = {
  green: {
    bg: "bg-green-950/25",
    border: "border-green-500/30",
    text: "text-green-200",
    muted: "text-green-300/60",
    pulse: "phase-hint-green",
  },
  red: {
    bg: "bg-red-950/25",
    border: "border-red-500/30",
    text: "text-red-200",
    muted: "text-red-300/60",
    pulse: "phase-hint-red",
  },
  blue: {
    bg: "bg-blue-950/25",
    border: "border-blue-500/30",
    text: "text-blue-200",
    muted: "text-blue-300/60",
    pulse: "phase-hint-blue",
  },
};

const SelectionHint = ({ phase }: { phase: Phase }) => {
  const hint = PHASE_HINTS[phase];
  const tone = TONE_CLASSES[hint.tone];
  const Icon = hint.icon;
  return (
    <div
      className={`mx-3 my-3 rounded-md border ${tone.border} ${tone.bg} ${tone.pulse} p-3 space-y-1.5`}
    >
      <div className={`flex items-center gap-1.5 ${tone.muted}`}>
        <Icon size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {hint.label}
        </span>
      </div>
      <div className={`flex items-start gap-1.5 text-[11px] ${tone.text}`}>
        <MousePointerClick size={12} className="mt-0.5 shrink-0" />
        <span>{hint.message}</span>
      </div>
    </div>
  );
};

type PlayerStat = GamePageController["playerStats"][number];
type RegionStat = GamePageController["myOwnedRegions"][number];
type NumberSetter = Dispatch<SetStateAction<number>>;

const PlayersPanel = ({
  playerStats,
  currentPlayer,
}: {
  playerStats: PlayerStat[];
  currentPlayer: number;
}) => {
  const prevStatusRef = useRef<Map<number, string | null>>(new Map());
  const [toasts, setToasts] = useState<Map<number, { bonus: number; id: number }>>(
    new Map(),
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    playerStats.forEach((p) => {
      // Don't toast on self — the MissionPanel already celebrates.
      if (p.isSelf) return;
      const prev = prevStatusRef.current.get(p.playerId) ?? null;
      if (prev !== "COMPLETED" && p.missionStatus === "COMPLETED") {
        const toastId = Date.now() + p.playerId;
        setToasts((curr) => {
          const next = new Map(curr);
          next.set(p.playerId, { bonus: p.missionBonusTroops, id: toastId });
          return next;
        });
        const timer = setTimeout(() => {
          setToasts((curr) => {
            const entry = curr.get(p.playerId);
            if (!entry || entry.id !== toastId) return curr;
            const next = new Map(curr);
            next.delete(p.playerId);
            return next;
          });
        }, 2200);
        timers.push(timer);
      }
      prevStatusRef.current.set(p.playerId, p.missionStatus);
    });
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [playerStats]);

  return (
    <>
      <div className="px-3 py-2 border-b border-amber-900/20">
        <h3 className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest">
          Players
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {playerStats.map((player, i) => {
          const toast = toasts.get(player.playerId);
          return (
            <div
              key={player.name}
              className={`relative rounded-lg p-2.5 transition-all ${
                !player.alive
                  ? "opacity-40 bg-white/3 border border-transparent"
                  : i === currentPlayer
                    ? "bg-amber-900/20 border border-amber-500/30"
                    : "bg-white/3 border border-transparent hover:bg-white/6"
              } ${toast ? "mission-toast-flash" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full ring-1 ring-white/20 shrink-0"
                  style={{ backgroundColor: player.color }}
                />
                <span
                  className={`text-sm font-semibold truncate min-w-0 ${
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
                  <span className="ml-auto shrink-0 text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-bold">
                    TURN
                  </span>
                )}
                {!player.alive && (
                  <span className="ml-auto shrink-0 text-[9px] text-red-400/60 bg-red-400/10 px-1.5 py-0.5 rounded font-bold">
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
              {toast && (
                <div
                  key={toast.id}
                  className="mission-toast pointer-events-none absolute -top-1.5 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-300/60 text-emerald-100 text-[10px] font-bold whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                >
                  <Trophy size={10} className="text-amber-300" />
                  <span>Mission</span>
                  <span className="text-amber-200">+{toast.bonus}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

type MissionInfo = NonNullable<GamePageController["myMission"]>;

const SPARKLE_OFFSETS = [
  { x: "-26px", y: "-30px", delay: "0ms" },
  { x: "28px", y: "-26px", delay: "80ms" },
  { x: "-14px", y: "-38px", delay: "160ms" },
  { x: "20px", y: "-40px", delay: "220ms" },
  { x: "-32px", y: "-12px", delay: "120ms" },
  { x: "32px", y: "-10px", delay: "200ms" },
];

const MissionPanel = ({
  mission,
  currentTurn,
}: {
  mission: MissionInfo;
  currentTurn: number;
}) => {
  const isLocked = mission.status === "LOCKED";
  const isCompleted = mission.status === "COMPLETED";
  const roundsRemaining = isLocked
    ? mission.startRound - currentTurn
    : mission.expiresAtRound - currentTurn;

  const prevStatusRef = useRef(mission.status);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (prevStatusRef.current !== "COMPLETED" && mission.status === "COMPLETED") {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 1700);
      prevStatusRef.current = mission.status;
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = mission.status;
  }, [mission.status]);

  const containerBase =
    "relative mx-3 mt-3 rounded-xl border overflow-hidden backdrop-blur-sm";
  const containerTone = isCompleted
    ? "border-emerald-400/50 bg-gradient-to-br from-emerald-950/50 via-emerald-900/30 to-amber-950/40"
    : isLocked
      ? "border-white/15 bg-gradient-to-br from-slate-900/60 to-slate-950/60"
      : "border-purple-400/50 bg-gradient-to-br from-purple-950/50 via-indigo-950/40 to-purple-900/40";

  const headingTone = isCompleted
    ? "text-emerald-300"
    : isLocked
      ? "text-white/45"
      : "text-purple-200";

  const descTone = isCompleted
    ? "text-emerald-50"
    : isLocked
      ? "text-white/60"
      : "text-purple-50";

  const Icon = isCompleted ? Trophy : isLocked ? Lock : Target;

  const label = isCompleted
    ? "Mission complete"
    : isLocked
      ? "Sealed mission"
      : "Active mission";

  return (
    <div
      className={`${containerBase} ${containerTone} ${
        celebrating ? "mission-complete-burst" : !isLocked && !isCompleted ? "mission-active-pulse" : ""
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[2px] ${
          isCompleted
            ? "bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent"
            : isLocked
              ? "bg-gradient-to-r from-transparent via-white/15 to-transparent"
              : "bg-gradient-to-r from-transparent via-purple-400/80 to-transparent"
        }`}
      />

      {celebrating &&
        SPARKLE_OFFSETS.map((s, i) => (
          <span
            key={i}
            className="mission-sparkle pointer-events-none absolute left-1/2 top-1/2 text-amber-300"
            style={
              {
                "--mission-sparkle-x": s.x,
                "--mission-sparkle-y": s.y,
                animationDelay: s.delay,
              } as React.CSSProperties
            }
          >
            <Sparkles size={12} />
          </span>
        ))}

      <div className="relative p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className={`${headingTone} shrink-0`} />
          <span
            className={`text-[10px] font-bold uppercase tracking-widest truncate ${headingTone}`}
          >
            {label}
          </span>
          <span
            className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
              isCompleted
                ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/40"
                : isLocked
                  ? "bg-white/5 text-white/45 border border-white/10"
                  : "bg-purple-400/20 text-purple-100 border border-purple-400/40"
            }`}
          >
            {isLocked
              ? `Round ${mission.startRound}`
              : isCompleted
                ? "DONE"
                : `${Math.max(0, roundsRemaining)} left`}
          </span>
        </div>

        <div className={`text-[12.5px] leading-snug font-medium ${descTone}`}>
          {mission.description}
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-md text-[12px] font-bold shrink-0 ${
                isCompleted
                  ? "bg-amber-400/30 text-amber-200 border border-amber-300/60"
                  : "bg-amber-500/10 text-amber-300/90 border border-amber-400/30"
              }`}
            >
              {isCompleted ? (
                <span className="mission-check-pop inline-flex">
                  <Check size={13} strokeWidth={3} />
                </span>
              ) : (
                "+"
              )}
            </span>
            <span className="text-[12px] text-amber-200/90 font-mono font-semibold whitespace-nowrap">
              {mission.bonusTroops} troops
            </span>
          </div>
          <span className="text-[10px] text-white/55 text-right whitespace-nowrap">
            {isLocked
              ? `Unlocks R${mission.startRound}`
              : isCompleted
                ? "Next turn"
                : `Ends R${mission.expiresAtRound}`}
          </span>
        </div>

        {celebrating && (
          <div className="mission-reward-ping pointer-events-none absolute right-3 bottom-3 text-emerald-200 text-[11px] font-bold font-mono">
            +{mission.bonusTroops}
          </div>
        )}
      </div>
    </div>
  );
};

const RegionBonusPanel = ({
  myRegionBonus,
  myOwnedRegions,
}: {
  myRegionBonus: number;
  myOwnedRegions: RegionStat[];
}) => (
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
          <div
            key={r.name}
            className="flex items-center justify-between text-[10px]"
          >
            <span className="text-amber-200/60">{r.name}</span>
            <span className="text-amber-300/80 font-mono">+{r.bonus}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-[10px] text-white/25 italic">
        No regions controlled
      </div>
    )}
  </div>
);

const DeployPanel = ({
  canDeployToSelected,
  selectedTerritory,
  reinforcements,
  deployTroops,
  setDeployTroops,
  isMyTurn,
  onDeploy,
}: {
  canDeployToSelected: boolean;
  selectedTerritory: string | null;
  reinforcements: number;
  deployTroops: number;
  setDeployTroops: NumberSetter;
  isMyTurn: boolean;
  onDeploy: () => void;
}) => (
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
            onClick={() => setDeployTroops((v) => Math.max(1, (v || 1) - 1))}
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
            className="flex-1 min-w-0 h-7 px-2 rounded bg-black/30 border border-green-500/30 text-green-100 text-sm font-mono"
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
          <button
            onClick={() => setDeployTroops(Math.max(1, reinforcements))}
            disabled={reinforcements <= 0}
            className={`h-7 px-2 rounded text-[10px] font-bold border tracking-wider uppercase transition-all ${
              reinforcements > 0
                ? "bg-green-900/30 hover:bg-green-800/40 text-green-200 border-green-500/30"
                : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
            }`}
          >
            Max
          </button>
        </div>

        <button
          onClick={onDeploy}
          disabled={!isMyTurn || reinforcements <= 0}
          className={`w-full min-h-11 px-4 py-2.5 rounded-md text-sm font-bold border tracking-wide transition-all ${
            isMyTurn && reinforcements > 0
              ? "bg-green-900/40 hover:bg-green-800/50 text-green-200 border-green-500/30 phase-hint-green cursor-pointer"
              : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
          }`}
        >
          Deploy troops
        </button>
      </div>
    )}
  </div>
);

const AttackPanel = ({
  selectedTerritory,
  targetTerritory,
  attackTroops,
  setAttackTroops,
  maxAttackTroops,
  canAttackSelectedTarget,
  onAttack,
}: {
  selectedTerritory: string | null;
  targetTerritory: string | null;
  attackTroops: number;
  setAttackTroops: NumberSetter;
  maxAttackTroops: number;
  canAttackSelectedTarget: boolean;
  onAttack: () => void;
}) => (
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
        onClick={() => setAttackTroops((v) => Math.max(1, (v || 1) - 1))}
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
        className="flex-1 min-w-0 h-7 px-2 rounded bg-black/30 border border-red-500/30 text-red-100 text-sm font-mono"
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
      <button
        onClick={() => setAttackTroops(Math.max(1, maxAttackTroops))}
        disabled={maxAttackTroops <= 0}
        className={`h-7 px-2 rounded text-[10px] font-bold border tracking-wider uppercase transition-all ${
          maxAttackTroops > 0
            ? "bg-red-900/30 hover:bg-red-800/40 text-red-200 border-red-500/30"
            : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
        }`}
      >
        Max
      </button>
    </div>

    <div className="text-[10px] text-red-300/60">
      Max available: {maxAttackTroops}
    </div>

    <button
      onClick={onAttack}
      disabled={!canAttackSelectedTarget}
      className={`w-full min-h-11 px-4 py-2.5 rounded-md text-sm font-bold border tracking-wide transition-all ${
        canAttackSelectedTarget
          ? "bg-red-900/40 hover:bg-red-800/50 text-red-200 border-red-500/30 phase-hint-red cursor-pointer"
          : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
      }`}
    >
      Attack
    </button>
  </div>
);

const FortifyPanel = ({
  selectedTerritory,
  targetTerritory,
  fortifyTroops,
  setFortifyTroops,
  maxFortifyTroops,
  canFortifySelectedTarget,
  onFortify,
}: {
  selectedTerritory: string | null;
  targetTerritory: string | null;
  fortifyTroops: number;
  setFortifyTroops: NumberSetter;
  maxFortifyTroops: number;
  canFortifySelectedTarget: boolean;
  onFortify: () => void;
}) => (
  <div className="p-3 border-t border-amber-900/20 bg-blue-950/20 space-y-2">
    <div className="text-[10px] text-blue-400/70 font-bold uppercase tracking-wider mb-1">
      Reinforce
    </div>

    <div className="text-[10px] text-blue-400/70 font-bold uppercase tracking-wider">
      Move
    </div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm text-blue-200 font-semibold">
      <span className="truncate">{selectedTerritory}</span>
      <span className="text-blue-300/70">&rarr;</span>
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
        className="flex-1 min-w-0 h-7 px-2 rounded bg-black/30 border border-blue-500/30 text-blue-100 text-sm font-mono"
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
      <button
        onClick={() => setFortifyTroops(Math.max(1, maxFortifyTroops))}
        disabled={maxFortifyTroops <= 0}
        className={`h-7 px-2 rounded text-[10px] font-bold border tracking-wider uppercase transition-all ${
          maxFortifyTroops > 0
            ? "bg-blue-900/30 hover:bg-blue-800/40 text-blue-200 border-blue-500/30"
            : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
        }`}
      >
        Max
      </button>
    </div>

    <div className="text-[10px] text-blue-300/60">
      Max available: {maxFortifyTroops}
    </div>

    <button
      onClick={onFortify}
      disabled={!canFortifySelectedTarget}
      className={`w-full min-h-11 px-4 py-2.5 rounded-md text-sm font-bold border tracking-wide transition-all ${
        canFortifySelectedTarget
          ? "bg-blue-900/40 hover:bg-blue-800/50 text-blue-200 border-blue-500/30 phase-hint-blue cursor-pointer"
          : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
      }`}
    >
      Move troops
    </button>
  </div>
);

const PlayerSidebar = ({
  playerStats,
  currentPlayer,
  myRegionBonus,
  myOwnedRegions,
  myMission,
  currentTurn,
  currentPhase,
  isMyTurn,
  reinforcements,
  canDeployToSelected,
  selectedTerritory,
  targetTerritory,
  deployTroops,
  setDeployTroops,
  attackTroops,
  setAttackTroops,
  fortifyTroops,
  setFortifyTroops,
  maxAttackTroops,
  maxFortifyTroops,
  hasAttackSelection,
  canAttackSelectedTarget,
  hasFortifySelection,
  canFortifySelectedTarget,
  onDeploy,
  onAttack,
  onFortify,
}: {
  playerStats: PlayerStat[];
  currentPlayer: number;
  myRegionBonus: number;
  myOwnedRegions: RegionStat[];
  myMission: GamePageController["myMission"];
  currentTurn: number;
  currentPhase: Phase;
  isMyTurn: boolean;
  reinforcements: number;
  canDeployToSelected: boolean;
  selectedTerritory: string | null;
  targetTerritory: string | null;
  deployTroops: number;
  setDeployTroops: NumberSetter;
  attackTroops: number;
  setAttackTroops: NumberSetter;
  fortifyTroops: number;
  setFortifyTroops: NumberSetter;
  maxAttackTroops: number;
  maxFortifyTroops: number;
  hasAttackSelection: boolean;
  canAttackSelectedTarget: boolean;
  hasFortifySelection: boolean;
  canFortifySelectedTarget: boolean;
  onDeploy: () => void;
  onAttack: () => void;
  onFortify: () => void;
}) => (
  <div className="w-64 bg-black/40 border-r border-amber-900/30 flex flex-col">
    {myMission && (
      <MissionPanel mission={myMission} currentTurn={currentTurn} />
    )}
    <PlayersPanel playerStats={playerStats} currentPlayer={currentPlayer} />
    <RegionBonusPanel
      myRegionBonus={myRegionBonus}
      myOwnedRegions={myOwnedRegions}
    />

    {currentPhase === "Deploy" && isMyTurn && (
      <>
        {!canDeployToSelected && reinforcements > 0 && (
          <SelectionHint phase="Deploy" />
        )}
        <DeployPanel
          canDeployToSelected={canDeployToSelected}
          selectedTerritory={selectedTerritory}
          reinforcements={reinforcements}
          deployTroops={deployTroops}
          setDeployTroops={setDeployTroops}
          isMyTurn={isMyTurn}
          onDeploy={onDeploy}
        />
      </>
    )}

    {currentPhase === "Attack" && isMyTurn && (
      hasAttackSelection ? (
        <AttackPanel
          selectedTerritory={selectedTerritory}
          targetTerritory={targetTerritory}
          attackTroops={attackTroops}
          setAttackTroops={setAttackTroops}
          maxAttackTroops={maxAttackTroops}
          canAttackSelectedTarget={canAttackSelectedTarget}
          onAttack={onAttack}
        />
      ) : (
        <SelectionHint phase="Attack" />
      )
    )}

    {currentPhase === "Fortify" && isMyTurn && (
      hasFortifySelection ? (
        <FortifyPanel
          selectedTerritory={selectedTerritory}
          targetTerritory={targetTerritory}
          fortifyTroops={fortifyTroops}
          setFortifyTroops={setFortifyTroops}
          maxFortifyTroops={maxFortifyTroops}
          canFortifySelectedTarget={canFortifySelectedTarget}
          onFortify={onFortify}
        />
      ) : (
        <SelectionHint phase="Fortify" />
      )
    )}
  </div>
);

export default PlayerSidebar;
