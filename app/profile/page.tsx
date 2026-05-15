"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  LogOut,
  Swords,
  Trophy,
  Percent,
} from "lucide-react";
import { User as UserType } from "@/types/user";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";

type Stats = {
  gamesPlayed: number;
  wins: number;
  winRate: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const { value: user, clear: clearUser } = useLocalStorage<UserType | null>(
    "user",
    null,
  );
  
  const { value:token, clear: clearToken } = useLocalStorage<string>("token", "");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    wins: 0,
    winRate: 0,
  });

  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    setStorageReady(true);
  }, []);

  
  useEffect (() =>{
    if(!storageReady) return; 
    if(!token ||!user?.id){
      router.replace("/login");
      return;
    }

    const fetchUser = async ()=> {
      try {
        const res = await fetch(`${getApiDomain()}/users/${user?.id}`, { 
          headers: {
            token: token,
          },
        }
      );

        if (res.status === 401) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setStats({
          gamesPlayed: Number(data?.gamesPlayed ?? 0),
          wins: Number(data?.wins ?? 0),
          winRate: Number(data?.winRate ?? 0),
        });
      } catch (err) {
        clearToken();
        clearUser();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [storageReady, token, user?.id]);
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch(`${getApiDomain()}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          password: newPassword
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }catch (err){
      setPwError("Password update failed.");
    }
  };

  const handleLogout = () => {
    clearToken();
    clearUser();
    router.push("/login");
  };
  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 rounded-full border border-[#FFD900]/30 text-[#FFD900]/70 shadow-[0_0_20px_rgba(255,217,0,0.1)]">
          <User size={32} />
        </div>
        <h1 className="font-audiowide text-2xl font-bold tracking-wider text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
          COMMANDER{" "}
          <span className="text-[#FFD900] [text-shadow:0_0_20px_rgba(255,217,0,0.4)]">
            PROFILE
          </span>
        </h1>
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-linear-to-r from-transparent to-[#FFD900]/30" />
          <Swords size={12} className="text-[#FFD900]/40" />
          <div className="flex-1 h-px bg-linear-to-l from-transparent to-[#FFD900]/30" />
        </div>
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-6">
        <Card className="rounded-md border border-[#FFD900]/12 bg-[rgba(14,12,6,0.55)] backdrop-blur-sm gap-0">
          <div className="flex flex-row items-center gap-2.5 px-6 py-4 border-b border-[#FFD900]/10">
            <div className="flex items-center justify-center p-1.5 border border-[#FFD900]/20 text-[#FFD900]/60">
              <User size={14} />
            </div>
            <span className="font-audiowide text-xs tracking-widest text-white/60 uppercase leading-none">
              Personal Information
            </span>
          </div>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-audiowide text-[10px] tracking-widest text-white/40 uppercase flex items-center gap-1.5">
                <span className="text-[#FFD900]/40">
                  <User size={13} />
                </span>
                Username
              </label>
              <div className="px-3 py-2.5 rounded border border-[#FFD900]/10 bg-[rgba(14,12,6,0.4)] text-white/70 text-sm">
                {user?.username ?? "Unknown User"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-md border border-[#FFD900]/12 bg-[rgba(14,12,6,0.55)] backdrop-blur-sm gap-0">
          <div className="flex flex-row items-center gap-2.5 px-6 py-4 border-b border-[#FFD900]/10">
            <div className="flex items-center justify-center p-1.5 border border-[#FFD900]/20 text-[#FFD900]/60">
              <Trophy size={14} />
            </div>
            <span className="font-audiowide text-xs tracking-widest text-white/60 uppercase leading-none">
              Battle Statistics
            </span>
          </div>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
            {[
              {
                label: "Games Played",
                value: stats.gamesPlayed,
                icon: <Swords size={14} />,
                highlight: false,
              },
              {
                label: "Victories",
                value: stats.wins,
                icon: <Trophy size={14} />,
                highlight: false,
              },
              {
                label: "Win Rate",
                value: `${Math.round(stats.winRate * 100)}%`,
                icon: <Percent size={14} />,
                highlight: false,
              },
            ].map(({ label, value, icon, highlight }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded border transition-all duration-300 ${
                  highlight
                    ? "border-[#FFD900]/30 bg-[rgba(255,217,0,0.04)] shadow-[0_0_16px_rgba(255,217,0,0.06)]"
                    : "border-[#FFD900]/10 bg-[rgba(14,12,6,0.35)]"
                }`}
              >
                <div
                  className={
                    highlight ? "text-[#FFD900]/80" : "text-[#FFD900]/40"
                  }
                >
                  {icon}
                </div>
                <span
                  className={`font-audiowide text-xl font-bold ${highlight ? "text-[#FFD900] [text-shadow:0_0_16px_rgba(255,217,0,0.4)]" : "text-white/80"}`}
                >
                  {value}
                </span>
                <span className="font-audiowide text-[9px] tracking-widest text-white/35 uppercase text-center">
                  {label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-md border border-[#FFD900]/12 bg-[rgba(14,12,6,0.55)] backdrop-blur-sm gap-0">
          <div className="flex flex-row items-center gap-2.5 px-6 py-4 border-b border-[#FFD900]/10">
            <div className="flex items-center justify-center p-1.5 border border-[#FFD900]/20 text-[#FFD900]/60">
              <KeyRound size={14} />
            </div>
            <span className="font-audiowide text-xs tracking-widest text-white/60 uppercase leading-none">
              Change Password
            </span>
          </div>
          <CardContent className="pt-5">
            <form
              onSubmit={handlePasswordChange}
              className="flex flex-col gap-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-audiowide text-[10px] tracking-widest text-white/40 uppercase">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[rgba(14,12,6,0.6)] border border-[#FFD900]/20 rounded text-white/80 text-sm px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-[#FFD900]/60 focus:shadow-[0_0_12px_rgba(255,217,0,0.08)] transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-audiowide text-[10px] tracking-widest text-white/40 uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[rgba(14,12,6,0.6)] border border-[#FFD900]/20 rounded text-white/80 text-sm px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-[#FFD900]/60 focus:shadow-[0_0_12px_rgba(255,217,0,0.08)] transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-audiowide text-[10px] tracking-widest text-white/40 uppercase">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[rgba(14,12,6,0.6)] border border-[#FFD900]/20 rounded text-white/80 text-sm px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-[#FFD900]/60 focus:shadow-[0_0_12px_rgba(255,217,0,0.08)] transition-all duration-200"
                  />
                </div>
              </div>

              {pwError && (
                <p className="text-red-400/80 text-xs font-audiowide tracking-wide">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-[#FFD900]/80 text-xs font-audiowide tracking-wide">
                  Password updated successfully.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex items-center gap-2 px-6 py-2.5 font-audiowide text-xs tracking-widest uppercase rounded-md bg-transparent border border-red-500/30 text-red-400/70 hover:bg-red-500/8 hover:border-red-500/60 hover:text-red-400 hover:shadow-[0_0_16px_rgba(239,68,68,0.12)] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <LogOut
                    size={13}
                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  />
                  Log Out
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 font-audiowide text-xs tracking-widest uppercase rounded-md bg-[#FFD900] text-[#0e0c06] font-bold border-none shadow-[0_0_20px_rgba(255,217,0,0.25)] hover:bg-[#ffe44d] hover:shadow-[0_0_32px_rgba(255,217,0,0.45)] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
