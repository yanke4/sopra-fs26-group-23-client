"use client";

import React, { useState } from "react";
import { Swords, UserPlus, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ApiService } from "@/api/apiService";
import { ApplicationError } from "@/types/error";

const apiService = new ApiService();

export default function JoinLobbyPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.id) {
      router.push("/login");
      return;
    }

    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 1500;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const lobby = await apiService.put<{ lobbyId: number }>(
          `/lobbies/${pin}`,
          { userId: Number(user.id) },
        );
        router.push(`/lobby?lobbyId=${lobby.lobbyId}`);
        return;
      } catch (err: unknown) {
        const isNotFound =
          err instanceof Error &&
          "status" in err &&
          (err as ApplicationError).status === 404;

        if (isNotFound && attempt < MAX_ATTEMPTS) {
          await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
          continue;
        }

        if (err instanceof Error && "status" in err) {
          const appError = err as ApplicationError;
          setError(appError.info || "Failed to find Lobby. Check your code.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        break;
      }
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 bg-[rgba(14,12,6,0.5)]">
      <Card className="w-full max-w-md rounded-lg border border-[#FFD900]/15 bg-[rgba(14,12,6,0.9)] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#FFD900]/10">
          <div className="flex items-center gap-2">
            <Swords size={14} className="text-[#FFD900]/70" />
            <span className="font-audiowide text-[10px] tracking-[0.2em] text-white/60 uppercase">
              Military Access
            </span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-white/40 hover:text-[#FFD900] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <CardContent className="flex flex-col gap-6 p-8">
          <div className="text-center">
            <h1 className="font-audiowide text-2xl font-bold tracking-wider text-white">
              JOIN CAMPAIGN
            </h1>
            <p className="text-[11px] text-white/40 tracking-widest uppercase mt-1">
              Enter the 6-digit deployment code
            </p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="000 000"
                className="w-full bg-black/40 border border-[#FFD900]/20 rounded-md py-4 text-center font-audiowide text-3xl tracking-[0.3em] text-[#FFD900] placeholder:text-[#FFD900]/10 focus:outline-none focus:border-[#FFD900]/50 transition-all"
                required
              />
              <UserPlus
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD900]/20"
                size={20}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded border border-red-500/20 bg-red-500/5 text-red-400 text-[11px] font-audiowide uppercase tracking-tighter">
                <ShieldAlert size={14} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || pin.length < 6}
              className={`h-14 font-audiowide tracking-[0.2em] transition-all cursor-pointer ${
                pin.length === 6 && !loading
                  ? "bg-[#FFD900] text-[#0e0c06] shadow-[0_0_20px_rgba(255,217,0,0.2)] hover:shadow-[0_0_30px_rgba(255,217,0,0.4)]"
                  : "bg-white/5 text-white/20 border border-white/10"
              }`}
            >
              {loading ? "VERIFYING..." : "INITIALIZE JOIN"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
