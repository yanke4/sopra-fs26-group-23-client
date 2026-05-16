"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
  CheckCircle2,
  Plus,
  Swords,
  LogOut,
  Timer,
  ChevronDown,
  Infinity as InfinityIcon,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiService } from "@/api/apiService";
import { getApiDomain } from "@/utils/domain";
import {
  useLobbySocket,
  LobbyWebSocketDTO,
  GameStartDTO,
} from "@/hooks/useLobbySocket";
import GameChat from "@/components/GameChat";
import BattleLoading from "@/components/battle-loading";

interface LobbyGetDTO {
  lobbyId: number;
  status: "OPEN" | "CLOSED";
  joinCode: number;
  host: { id: number; username: string };
  jointUsers: { id: number; username: string }[];
  turnTimerSeconds: number | null;
  colorPreferences: Record<number, string>;
  fogOfWarEnabled: boolean;
}

const TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "No limit", value: null },
];

const PLAYER_COLORS: { key: string; hex: string; label: string }[] = [
  { key: "RED",    hex: "#b91c1c", label: "Red"    },
  { key: "BLUE",   hex: "#4361EE", label: "Blue"   },
  { key: "GREEN",  hex: "#15803d", label: "Green"  },
  { key: "YELLOW", hex: "#FFD60A", label: "Yellow" },
  { key: "PURPLE",   hex: "#bc12df", label: "Purple"},
  { key: "ORANGE",   hex: "#f37005", label: "Orange"   },
];

const apiService = new ApiService();

export default function LobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center text-white/40 font-audiowide tracking-widest text-sm uppercase">
          Loading…
        </div>
      }
    >
      <LobbyContent />
    </Suspense>
  );
}

function LobbyContent() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [lobby, setLobby] = useState<LobbyGetDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; color: string } | null>(null);
  const [gameStarting, setGameStarting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingColor, setSavingColor] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [kickTarget, setKickTarget] = useState<{ id: number; username: string } | null>(null);
  const [kickInFlight, setKickInFlight] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;

    if (!user?.id) {
      router.push("/login");
      return;
    }
    setCurrentUserId(Number(user.id));
    setCurrentUser({id: String(user.id), name: user.username, color:user.color});
    const lobbyIdParam = searchParams.get("lobbyId");

    if (lobbyIdParam) {
      apiService
        .get<LobbyGetDTO>(`/lobbies/${lobbyIdParam}`)
        .then((fetched) => setLobby(fetched))
        .catch((err) => setError(err.message));
    } else {
      apiService
        .post<LobbyGetDTO>("/lobbies", { hostId: Number(user.id) })
        .then((created) => {
          router.replace(`/lobby?lobbyId=${created.lobbyId}`);
          setLobby(created);
        })
        .catch((err) => setError(err.message));
    }
  }, [router, searchParams]);

  const handleLobbyUpdate = useCallback(
    (updated: LobbyWebSocketDTO) => {
      if (updated.status === "CLOSED") {
        router.push("/");
        return;
      }
      if (
        currentUserId !== null &&
        updated.hostId !== currentUserId &&
        !updated.jointUserIds.includes(currentUserId)
      ) {
        router.push("/?kicked=1");
        return;
      }
      apiService
        .get<LobbyGetDTO>(`/lobbies/${updated.lobbyId}`)
        .then((fresh) => setLobby(fresh))
        .catch((err) => console.error("Failed to refresh lobby:", err));
    },
    [router, currentUserId],
  );

  const confirmKick = async () => {
    if (!lobby || !currentUserId || !kickTarget) return;
    try {
      setKickInFlight(true);
      await apiService.post(`/lobbies/${lobby.lobbyId}/kick`, {
        userId: currentUserId,
        targetUserId: kickTarget.id,
      });
      setKickTarget(null);
    } catch (err) {
      console.error("Failed to kick member:", err);
    } finally {
      setKickInFlight(false);
    }
  };

  const handleColorSelect = async (colorKey: string) => {
    if (!lobby || !currentUserId || savingColor) return;
    const taken = Object.entries(lobby.colorPreferences ?? {}).some(
      ([uid, c]) => c === colorKey && Number(uid) !== currentUserId
    );
    if (taken) return;
    try {
      setSavingColor(true);
      await apiService.put<LobbyGetDTO>(`/lobbies/${lobby.lobbyId}/colors`, {
        userId: currentUserId,
        color: colorKey,
      });
    } catch (err) {
      console.error("Failed to select color:", err);
    } finally {
      setSavingColor(false);
    }
  };

  const handleGameStart = useCallback(
    (data: GameStartDTO) => {
      localStorage.setItem("gameId", String(data.gameId));
      sessionStorage.setItem("battleLoading", String(data.gameId));
      setGameStarting(true);
      router.push(`/game/${data.gameId}`);
    },
    [router],
  );

  useLobbySocket({
    lobbyId: lobby?.lobbyId ?? null,
    onLobbyUpdate: handleLobbyUpdate,
    onGameStart: handleGameStart,
  });

  useEffect(() => {
    if (!lobby || !currentUserId) return;

    const handleBeforeUnload = () => {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : null;
      if (!user?.id || !lobby) return;

      const baseUrl = getApiDomain().replace(/\/$/, "");
      fetch(`${baseUrl}/lobbies/${lobby.lobbyId}/members/${user.id}`, {
        method: "DELETE",
        keepalive: true,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [lobby, currentUserId]);

  const copyToClipboard = () => {
    if (!lobby) return;
    navigator.clipboard.writeText(String(lobby.joinCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (gameStarting) {
    return <BattleLoading message="Marshalling the legions" />;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="h-screen flex items-center justify-center text-white/40 font-audiowide tracking-widest text-sm uppercase">
        Creating lobby…
      </div>
    );
  }

  const allUsers = [lobby.host, ...lobby.jointUsers];
  const maxPlayers = 4;
  const canStart = allUsers.length >= 2;
  const isHost = currentUserId === lobby.host.id;
  const accessCode = String(lobby.joinCode).replace(/(\d{3})(\d{3})/, "$1 $2");

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center px-3 py-4 sm:py-6 bg-[rgba(14,12,6,0.5)]">
      <div className="w-full max-w-5xl h-full max-h-[820px] flex flex-col lg:flex-row gap-3">
        <Card className="flex-1 lg:max-w-xl flex flex-col min-h-0 rounded-lg border border-[#FFD900]/15 bg-[rgba(14,12,6,0.9)] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* --- HEADER --- */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#FFD900]/10">
            <div className="flex items-center gap-2">
              <Swords size={13} className="text-[#FFD900]/70" />
              <span className="font-audiowide text-[10px] tracking-[0.2em] text-white/60 uppercase">
                Game Lobby
              </span>
            </div>
            <span className="font-audiowide text-[9px] tracking-widest text-white/35 uppercase">
              {allUsers.length}/{maxPlayers} commanders
            </span>
          </div>

          <CardContent className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-3">
            {/* --- ACCESS CODE --- */}
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded border border-[#FFD900]/25 bg-[rgba(255,217,0,0.05)]">
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-audiowide text-[9px] tracking-widest text-[#FFD900]/50 uppercase">
                  Access Code
                </span>
                <span className="font-audiowide text-xl sm:text-2xl font-black text-[#FFD900] tracking-[0.15em]">
                  {accessCode}
                </span>
              </div>
              <Button
                onClick={copyToClipboard}
                className={`h-8 px-3 font-audiowide text-[9px] tracking-widest uppercase transition-all cursor-pointer ${
                  copied
                    ? "bg-green-600 text-white hover:bg-green-500"
                    : "bg-[#FFD900] text-[#0e0c06] hover:bg-[#ffe44d]"
                }`}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* --- GAME SETTINGS --- */}
            <div className="rounded border border-[#FFD900]/25 bg-[rgba(255,217,0,0.04)]">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5 rounded-t transition-colors"
              >
                <span className="font-audiowide text-[10px] tracking-[0.25em] text-[#FFD900]/70 uppercase flex-1 text-left">
                  Game Settings
                </span>
                {!isHost && (
                  <span className="text-[9px] text-white/30 italic">host only</span>
                )}
                <ChevronDown
                  size={14}
                  className={`text-[#FFD900]/70 transition-transform duration-200 ${
                    settingsExpanded ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>

              {settingsExpanded && (
                <div className="px-3 pb-3 pt-2 flex flex-col gap-3 border-t border-[#FFD900]/10">
                  {/* Timer */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Timer size={11} className="text-white/50" />
                      <span className="font-audiowide text-[9px] tracking-[0.15em] text-white/50 uppercase">
                        Turn Timer
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TIMER_OPTIONS.map((opt) => {
                        const active = lobby.turnTimerSeconds === opt.value;
                        return (
                          <button
                            key={String(opt.value)}
                            disabled={!isHost || savingSettings || active}
                            onClick={async () => {
                              try {
                                setSavingSettings(true);
                                await apiService.put<LobbyGetDTO>(
                                  `/lobbies/${lobby.lobbyId}/settings`,
                                  {
                                    userId: currentUserId,
                                    turnTimerSeconds: opt.value,
                                    fogOfWarEnabled: lobby.fogOfWarEnabled,
                                  },
                                );
                              } catch (err) {
                                console.error("Failed to update timer:", err);
                              } finally {
                                setSavingSettings(false);
                              }
                            }}
                            className={`flex items-center justify-center gap-1 h-8 rounded font-audiowide text-[10px] tracking-[0.15em] uppercase border transition-all ${active
                              ? "bg-[#FFD900] text-[#0e0c06] border-[#FFD900] shadow-[0_0_14px_rgba(255,217,0,0.4)]"
                              : isHost
                                ? "bg-white/5 text-white/70 border-[#FFD900]/15 hover:border-[#FFD900]/50 hover:text-[#FFD900] hover:bg-[#FFD900]/5 cursor-pointer"
                                : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                              } ${savingSettings && !active ? "opacity-60" : ""}`}
                          >
                            {opt.value == null ? (
                              <InfinityIcon size={11} />
                            ) : (
                              <Timer size={11} />
                            )}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fog of War */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="font-audiowide text-[9px] tracking-[0.15em] text-white/50 uppercase">
                        Fog of War
                      </span>
                      <span className="text-[9px] text-white/35 italic truncate">
                        Limits vision to your borders
                      </span>
                    </div>
                    <button
                      disabled={!isHost || savingSettings}
                      onClick={async () => {
                        try {
                          setSavingSettings(true);
                          await apiService.put<LobbyGetDTO>(
                            `/lobbies/${lobby.lobbyId}/settings`,
                            {
                              userId: currentUserId,
                              turnTimerSeconds: lobby.turnTimerSeconds,
                              fogOfWarEnabled: !lobby.fogOfWarEnabled,
                            },
                          );
                        } catch (err) {
                          console.error("Failed to update fog of war:", err);
                        } finally {
                          setSavingSettings(false);
                        }
                      }}
                      className={`flex items-center justify-center px-4 h-8 rounded font-audiowide text-[10px] tracking-[0.15em] uppercase border transition-all flex-shrink-0 ${lobby.fogOfWarEnabled
                        ? "bg-[#FFD900] text-[#0e0c06] border-[#FFD900] shadow-[0_0_14px_rgba(255,217,0,0.4)]"
                        : isHost
                          ? "bg-white/5 text-white/70 border-[#FFD900]/15 hover:border-[#FFD900]/50 hover:text-[#FFD900] hover:bg-[#FFD900]/5 cursor-pointer"
                          : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                        } ${savingSettings ? "opacity-60" : ""}`}
                    >
                      {lobby.fogOfWarEnabled ? "On" : "Off"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* --- COMMANDERS --- */}
            <div className="flex flex-col gap-1.5">
              <h2 className="font-audiowide text-[10px] tracking-widest text-white/60 uppercase px-1">
                Commanders
              </h2>
              <div className="flex flex-col gap-1.5">
                {allUsers.map((user) => {
                  const isRowHost = user.id === lobby.host.id;
                  const isMe = user.id === currentUserId;
                  const myColor = lobby.colorPreferences?.[currentUserId ?? -1];
                  const rowColor = lobby.colorPreferences?.[user.id];
                  const rowColorHex = PLAYER_COLORS.find((c) => c.key === rowColor)?.hex;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-3 py-2 rounded border border-[#FFD900]/10 bg-[rgba(255,217,0,0.02)]"
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center font-black text-sm text-white/90 flex-shrink-0"
                        style={{ backgroundColor: rowColorHex ?? "#374151" }}
                      >
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-audiowide text-xs text-white truncate">
                            {user.username}
                          </span>
                          {isRowHost && (
                            <span className="text-[8px] px-1 py-px border border-[#FFD900]/30 text-[#FFD900]/70 uppercase font-audiowide rounded flex-shrink-0">
                              Host
                            </span>
                          )}
                        </div>
                        <span className="font-audiowide text-[9px] text-[#38BDF8]/80 uppercase truncate">
                          {rowColor
                            ? rowColor.charAt(0) + rowColor.slice(1).toLowerCase()
                            : "No color"}
                        </span>
                      </div>

                      {isMe ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {PLAYER_COLORS.map((c) => {
                            const takenByOther = Object.entries(
                              lobby.colorPreferences ?? {},
                            ).some(
                              ([uid, val]) =>
                                val === c.key && Number(uid) !== currentUserId,
                            );
                            const isSelected = myColor === c.key;
                            return (
                              <button
                                key={c.key}
                                title={c.label}
                                disabled={takenByOther || savingColor}
                                onClick={() => handleColorSelect(c.key)}
                                className="w-5 h-5 rounded-full transition-all"
                                style={{
                                  backgroundColor: c.hex,
                                  opacity: takenByOther ? 0.2 : 1,
                                  outline: isSelected
                                    ? "2px solid #FFD900"
                                    : "2px solid transparent",
                                  outlineOffset: "1px",
                                  cursor: takenByOther ? "not-allowed" : "pointer",
                                  boxShadow: isSelected
                                    ? `0 0 8px ${c.hex}80`
                                    : "none",
                                }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <CheckCircle2
                            size={16}
                            className={rowColor ? "text-green-500/80" : "text-white/15"}
                          />
                          {isHost && !isRowHost && (
                            <button
                              onClick={() => setKickTarget({ id: user.id, username: user.username })}
                              title={`Kick ${user.username}`}
                              className="p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <UserX size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {Array.from({ length: maxPlayers - allUsers.length }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 rounded border border-dashed border-white/5 opacity-40"
                    >
                      <div className="w-8 h-8 rounded border border-dashed border-white/20 flex items-center justify-center text-white/20">
                        <Plus size={14} />
                      </div>
                      <span className="font-audiowide text-[11px] text-white/20 uppercase tracking-widest">
                        Open Slot
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {startError && (
              <div className="text-red-400 text-[10px] font-audiowide uppercase tracking-tighter text-center">
                {startError}
              </div>
            )}
          </CardContent>

          {/* --- ACTION BAR --- */}
          <div className="flex-shrink-0 flex flex-row gap-2 px-3 py-2.5 border-t border-[#FFD900]/10">
            {isHost && (
              <Button
                onClick={async () => {
                  setStartError(null);
                  try {
                    const fresh = await apiService.get<LobbyGetDTO>(
                      `/lobbies/${lobby.lobbyId}`,
                    );
                    if (!fresh.host || fresh.host.id !== currentUserId) {
                      setStartError("You are no longer the host.");
                      setLobby(fresh);
                      return;
                    }
                    await apiService.put(`/lobbies/${lobby.lobbyId}/start`, {
                      userId: currentUserId,
                    });
                  } catch (err) {
                    console.error("Failed to start game:", err);
                    setStartError("Failed to start the game. Please try again.");
                  }
                }}
                disabled={!canStart}
                className={`flex-[3] h-10 font-audiowide text-xs tracking-[0.2em] transition-all cursor-pointer ${
                  canStart
                    ? "bg-[#FFD900] text-[#0e0c06] shadow-[0_0_20px_rgba(255,217,0,0.2)] hover:bg-[#ffe44d] hover:shadow-[0_0_30px_rgba(255,217,0,0.4)]"
                    : "bg-white/5 text-white/20 border border-white/10 hover:bg-white/5"
                }`}
              >
                START CONQUEST
              </Button>
            )}

            <button
              onClick={async () => {
                const stored = localStorage.getItem("user");
                const user = stored ? JSON.parse(stored) : null;
                if (lobby && user?.id) {
                  try {
                    await apiService.delete(
                      `/lobbies/${lobby.lobbyId}/members/${user.id}`,
                    );
                  } catch (err) {
                    console.error("Failed to leave lobby:", err);
                  }
                }
                router.push("/");
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 h-10 font-audiowide text-[10px] tracking-widest uppercase rounded-md bg-transparent border border-red-500/30 text-red-400/70 hover:bg-red-500/8 hover:border-red-500/60 hover:text-red-400 hover:shadow-[0_0_16px_rgba(239,68,68,0.12)] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={12} className="rotate-180" />
              Leave
            </button>
          </div>
        </Card>

        {currentUser && lobby && (
          <div className="w-full lg:w-80 lg:flex-shrink-0 flex flex-col min-h-0 rounded-lg border border-[#FFD900]/15 bg-[rgba(14,12,6,0.9)] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <GameChat
              gameId={String(lobby.lobbyId)}
              currentUser={{ ...currentUser, color: (lobby.colorPreferences?.[currentUserId ?? -1] ?? "GRAY").toLowerCase() }}
              apiUrl={process.env.NEXT_PUBLIC_PROD_API_URL ?? "http://localhost:8080"}
            />
          </div>
        )}
      </div>

      {kickTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !kickInFlight && setKickTarget(null)}
          />
          <div className="relative z-10 bg-[#0f0d0b] border border-[#FFD900]/25 rounded-xl shadow-2xl shadow-black/80 p-6 w-80 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-900/40 border border-red-500/30">
                <UserX size={16} className="text-red-400" />
              </div>
              <h2 className="font-audiowide text-sm tracking-widest text-white uppercase">
                Kick Commander?
              </h2>
            </div>
            <p className="text-white/55 text-xs leading-relaxed">
              Remove{" "}
              <span className="text-[#FFD900] font-audiowide">
                {kickTarget.username}
              </span>{" "}
              from the lobby. They can rejoin with the access code.
            </p>
            <div className="h-px bg-[#FFD900]/15" />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setKickTarget(null)}
                disabled={kickInFlight}
                className="px-4 py-1.5 rounded font-audiowide text-[10px] tracking-widest uppercase border border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmKick}
                disabled={kickInFlight}
                className="px-4 py-1.5 rounded font-audiowide text-[10px] tracking-widest uppercase border border-red-500/40 bg-red-900/40 text-red-300 hover:bg-red-800/55 hover:text-red-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {kickInFlight ? "Kicking…" : "Kick"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}