"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Trophy, Medal, LoaderCircle } from "lucide-react";

interface UserStats {
  userId: number;
  username: string;
  wins: number;
  gamesPlayed: number;
  winPercentage: number;
}

const getRankIcon = (rank: number) => {
  if (rank === 0)
    return (
      <Crown
        size={20}
        className="text-yellow-400 filter-[drop-shadow(0_0_4px_rgba(255,217,0,0.5))]"
      />
    );
  if (rank === 1) return <Trophy size={20} className="text-slate-300" />;
  if (rank === 2) return <Medal size={20} className="text-amber-700" />;
  return (
    <span className="text-sm font-mono text-white/30 w-5 text-center">
      {rank + 1}
    </span>
  );
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/leaderboard`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch leaderboard:", errorText);
        throw new Error(
          `Failed to fetch leaderboard. Status: ${response.status}`,
        );
      }

      const data: UserStats[] = await response.json();

      // Add a defensive sort on the client to ensure correct order
      data.sort((a, b) => {
        // 1. Sort by wins descending
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }
        // 2. Then by gamesPlayed descending
        if (b.gamesPlayed !== a.gamesPlayed) {
          return b.gamesPlayed - a.gamesPlayed;
        }
        // 3. Then by username ascending (case-insensitive)
        return a.username.localeCompare(b.username, undefined, {
          sensitivity: "base",
        });
      });

      setLeaderboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Re-fetch when the window gets focus to ensure data is always fresh
    window.addEventListener("focus", fetchLeaderboard);
    return () => {
      window.removeEventListener("focus", fetchLeaderboard);
    };
  }, [fetchLeaderboard]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoaderCircle size={32} className="animate-spin text-[#FFD900]/50" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400/80 py-10">
          <p>Error loading leaderboard:</p>
          <p className="text-sm text-red-400/60">{error}</p>
        </div>
      );
    }

    if (leaderboard.length === 0) {
      return (
        <div className="text-center text-white/40 py-10">
          <p>The battlefield is quiet... No heroes yet.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_100px_100px_100px] gap-4 px-4 py-2 border-b border-[#FFD900]/10">
          <span className="font-audiowide text-[10px] tracking-widest uppercase text-[#FFD900]/60">
            Rank
          </span>
          <span className="font-audiowide text-[10px] tracking-widest uppercase text-[#FFD900]/60">
            Player
          </span>
          <span className="font-audiowide text-[10px] tracking-widest uppercase text-[#FFD900]/60 text-right">
            Points
          </span>
          <span className="font-audiowide text-[10px] tracking-widest uppercase text-[#FFD900]/60 text-right">
            Played
          </span>
          <span className="font-audiowide text-[10px] tracking-widest uppercase text-[#FFD900]/60 text-right">
            Win %
          </span>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {leaderboard.map((user, index) => (
            <div
              key={user.userId}
              className="grid grid-cols-[40px_1fr_100px_100px_100px] gap-4 items-center px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center justify-center h-full">
                {getRankIcon(index)}
              </div>
              <span className="font-semibold text-white/90 truncate">
                {user.username}
              </span>
              <span className="font-mono text-white/70 text-right">
                {user.wins}
              </span>
              <span className="font-mono text-white/70 text-right">
                {user.gamesPlayed}
              </span>
              <span className="font-mono text-white/70 text-right">
                {(user.winPercentage * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 px-4 sm:px-8">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-5xl font-audiowide font-bold tracking-wider text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
            HALL OF{" "}
            <span className="text-[#FFD900] [text-shadow:0_0_20px_rgba(255,217,0,0.4)]">
              FAME
            </span>
          </h1>
          <p className="text-sm text-white/50 tracking-wide">
            Ranking of the most formidable commanders across Europe.
          </p>
        </div>

        <div className="rounded-lg border border-[#FFD900]/15 bg-[rgba(14,12,6,0.8)] backdrop-blur-md shadow-2xl shadow-black/50 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}