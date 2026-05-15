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
  { key: "RED",    hex: "#E63946", label: "Red"    },
  { key: "BLUE",   hex: "#4361EE", label: "Blue"   },
  { key: "GREEN",  hex: "#2D6A4F", label: "Green"  },
  { key: "YELLOW", hex: "#FFD60A", label: "Yellow" },
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
      apiService
        .get<LobbyGetDTO>(`/lobbies/${updated.lobbyId}`)
        .then((fresh) => setLobby(fresh))
        .catch((err) => console.error("Failed to refresh lobby:", err));
    },
    [router],
  );

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
    <div className="h-screen overflow-hidden flex items-center justify-center px-4 py-10 bg-[rgba(14,12,6,0.5)]">
      <div className="w-full max-w-6xl h-full max-h-[900px] flex flex-col lg:flex-row gap-5">
        <Card className="flex-1 lg:max-w-2xl flex flex-col min-h-0rounded-lg border border-[#FFD900]/15 bg-[rgba(14,12,6,0.9)] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#FFD900]/10">
            <div className="flex items-center gap-2">
              <Swords size={14} className="text-[#FFD900]/70" />
              <span className="font-audiowide text-[10px] tracking-[0.2em] text-white/60 uppercase">
                Conquest of Europe
              </span>
            </div>
          </div>

          <CardContent className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-5">
            <div className="text-center">
              <h1 className="font-audiowide text-2xl font-bold tracking-wider text-white">
                GAME LOBBY
              </h1>
              <p className="text-[11px] text-white/40 tracking-widest uppercase mt-1">
                Waiting for commanders to assemble
              </p>
            </div>

            
            {/* --- ACCESS CODE --- */}
            <div className="flex items-center justify-between gap-4 p-4 rounded border border-[#FFD900]/25 bg-[rgba(255,217,0,0.05)]">
              <div className="flex flex-col">
                <span className="font-audiowide text-[10px] tracking-widest text-[#FFD900]/50 uppercase">
                  Access Code
                </span>
                <span className="font-audiowide text-3xl font-black text-[#FFD900] tracking-[0.15em]">
                  {accessCode}
                </span>
              </div>
              <Button
                onClick={copyToClipboard}
                className={`h-10 px-5 font-audiowide text-[10px] tracking-widest uppercase transition-all cursor-pointer ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-[#FFD900] text-[#0e0c06] hover:bg-[#ffe44d]"
                }`}
              >
                {copied ? "Copied" : "Copy Code"}
              </Button>
            </div>

        {/* --- GAME SETTINGS PANEL --- */}
            <div className="flex flex-col gap-2 p-4 rounded border border-[#FFD900]/25 bg-[rgba(255,217,0,0.04)]">
              {/* Clickable Header for Toggling */}
              <div 
                className="flex items-center gap-2 border-b border-[#FFD900]/10 pb-2 cursor-pointer hover:bg-white/5 p-1 -m-1 rounded transition-colors"
                onClick={() => setSettingsExpanded(!settingsExpanded)}
              >
                <span className="font-audiowide text-[10px] tracking-[0.25em] text-[#FFD900]/70 uppercase flex-1">
                    Game Settings
                </span>
                {!isHost && (
                  <span className="ml-auto text-[9px] text-white/30 italic">
                    host only
                  </span>
                )}
                <ChevronDown 
                  size={16} 
                  className={`text-[#FFD900]/70 transition-transform duration-200 ${
                    settingsExpanded ? "rotate-0" : "-rotate-90"
                  }`} 
                />
              </div>
              {/* Collapsible Content */ }
              {settingsExpanded && (
                <div className="flex flex-col gap-4 mt-2 transition-all">
                  {/* --- Timer Settings --- */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Timer size={13} className="text-white/50" />
                      <span className="font-audiowide text-[9px] tracking-[0.15em] text-white/50 uppercase">
                        Turn Timer
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
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
                            className={`flex items-center justify-center gap-1.5 h-12 rounded-md font-audiowide text-xs tracking-[0.2em] uppercase border transition-all ${active
                              ? "bg-[#FFD900] text-[#0e0c06] border-[#FFD900] shadow-[0_0_18px_rgba(255,217,0,0.45)]"
                              : isHost
                                ? "bg-white/5 text-white/70 border-[#FFD900]/15 hover:border-[#FFD900]/50 hover:text-[#FFD900] hover:bg-[#FFD900]/5 cursor-pointer"
                                : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                              } ${savingSettings && !active ? "opacity-60" : ""}`}
                          >
                            {opt.value == null ? (
                              <InfinityIcon size={14} />
                            ) : (
                              <Timer size={13} />
                            )}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-white/35 italic">
                      When time runs out, the turn auto-passes to the next player.
                    </p>
                  </div>

                  {/* --- Fog of War Settings --- */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-audiowide text-[9px] tracking-[0.15em] text-white/50 uppercase">
                        Fog of War
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
                      className={`flex items-center justify-center gap-1.5 h-12 rounded-md font-audiowide text-xs tracking-[0.2em] uppercase border transition-all ${lobby.fogOfWarEnabled
                        ? "bg-[#FFD900] text-[#0e0c06] border-[#FFD900] shadow-[0_0_18px_rgba(255,217,0,0.45)]"
                        : isHost
                          ? "bg-white/5 text-white/70 border-[#FFD900]/15 hover:border-[#FFD900]/50 hover:text-[#FFD900] hover:bg-[#FFD900]/5 cursor-pointer"
                          : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                        } ${savingSettings ? "opacity-60" : ""}`}
                    >
                      {lobby.fogOfWarEnabled ? "Enabled" : "Disabled"}
                    </button>
                    <p className="text-[10px] text-white/35 italic">
                      Your vision is restricted to territories you control and their immediate borders.
                    </p>
                  </div>
                </div>
              )}
          </div>


        {/* --- Players panel --- */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end px-1">
                <h2 className="font-audiowide text-xs tracking-widest text-white/80 uppercase">
                  Commanders ({allUsers.length}/{maxPlayers})
                </h2>
              </div>

              <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-1
                [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#FFD900]/30 ...">
                {allUsers.map((user) => {
                  const isRowHost = user.id === lobby.host.id;
                  const isMe = user.id === currentUserId;
                  const myColor = lobby.colorPreferences?.[currentUserId ?? -1];
                  const rowColor = lobby.colorPreferences?.[user.id];
                  const rowColorHex = PLAYER_COLORS.find((c) => c.key === rowColor)?.hex;

                  return (
                    <div
                      key={user.id}
                      className="flex flex-col gap-2 px-4 py-3 rounded border border-[#FFD900]/10 bg-[rgba(255,217,0,0.02)] "
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded flex items-center justify-center font-black text-white/90"
                            style={{ backgroundColor: rowColorHex ?? "#374151" }}
                          >
                            {user.username[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-audiowide text-sm text-white">
                                {user.username}
                              </span>
                              {isRowHost && (
                                <span className="text-[8px] px-1.5 py-0.5 border border-[#FFD900]/30 text-[#FFD900]/70 uppercase font-audiowide">
                                  Host
                                </span>
                              )}
                            </div>
                            <span className="font-audiowide text-[9px] text-[#38BDF8] tracking-tighter uppercase">
                              {rowColor
                                ? rowColor.charAt(0) + rowColor.slice(1).toLowerCase()
                                : "No color chosen"}
                            </span>
                          </div>
                        </div>
                        <CheckCircle2
                          size={18}
                          className={rowColor ? "text-green-500" : "text-white/20"}
                        />
                      </div>

                      {isMe && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="font-audiowide text-[9px] text-white/30 uppercase tracking-widest mr-1">
                            Your color
                          </span>
                          {PLAYER_COLORS.map((c) => {
                            const takenByOther = Object.entries(
                              lobby.colorPreferences ?? {}
                            ).some(
                              ([uid, val]) =>
                                val === c.key && Number(uid) !== currentUserId
                            );
                            const isSelected = myColor === c.key;
                            return (
                              <button
                                key={c.key}
                                title={c.label}
                                disabled={takenByOther || savingColor}
                                onClick={() => handleColorSelect(c.key)}
                                className="relative w-7 h-7 rounded-full transition-all"
                                style={{
                                  backgroundColor: c.hex,
                                  opacity: takenByOther ? 0.2 : 1,
                                  outline: isSelected
                                    ? "2px solid #FFD900"
                                    : "2px solid transparent",
                                  outlineOffset: "2px",
                                  cursor: takenByOther ? "not-allowed" : "pointer",
                                  boxShadow: isSelected
                                    ? `0 0 10px ${c.hex}80`
                                    : "none",
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {Array.from({ length: maxPlayers - allUsers.length }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-2.5 rounded border border-dashed border-white/5 bg-transparent opacity-40"
                    >
                      <div className="w-9 h-9 rounded border border-dashed border-white/20 flex items-center justify-center text-white/20">
                        <Plus size={16} />
                      </div>
                      <span className="font-audiowide text-xs text-white/20 uppercase tracking-widest">
                        Open Slot
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {startError && (
              <div className="text-red-400 text-[11px] font-audiowide uppercase tracking-tighter text-center">
                {startError}
              </div>
            )}

            <div className="flex-shrink-0 flex flex-row gap-2 px-5 pb-5 pt-3
              border-t border-[#FFD900]/10">
              {isHost && (
                <Button
                  onClick={async () => {
                    setStartError(null);
                    try {
                      const fresh = await apiService.get<LobbyGetDTO>(
                        `/lobbies/${lobby.lobbyId}`
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
                  className={`flex-3 h-12 font-audiowide tracking-[0.2em] transition-all cursor-pointer ${
                    canStart
                      ? "bg-[#FFD900] text-[#0e0c06] shadow-[0_0_20px_rgba(255,217,0,0.2)] hover:shadow-[0_0_30px_rgba(255,217,0,0.4)]"
                      : "bg-white/5 text-white/20 border border-white/10"
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
                className="flex-1 flex items-center justify-center gap-2 px-6 h-12 font-audiowide text-xs tracking-widest uppercase rounded-md bg-transparent border border-red-500/30 text-red-400/70 hover:bg-red-500/8 hover:border-red-500/60 hover:text-red-400 hover:shadow-[0_0_16px_rgba(239,68,68,0.12)] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <LogOut size={14} className="rotate-180" />
                Leave
              </button>
            </div>
          </CardContent>
        </Card>

        {currentUser && lobby && (
          <div className="w-full lg:w-96 lg:flex-shrink-0 flex flex-col min-h-0 rounded-lg border border-[#FFD900]/15 bg-[rgba(14,12,6,0.9)] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <GameChat
              gameId={String(lobby.lobbyId)}
              currentUser={{...currentUser, color: (lobby.colorPreferences?.[currentUserId ?? -1] ?? "GRAY").toLowerCase()}} 
              apiUrl={process.env.NEXT_PUBLIC_PROD_API_URL ?? "http://localhost:8080"}
            />
          </div>
        )}
      </div>
    </div>
  );
}