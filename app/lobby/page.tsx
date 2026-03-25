"use client";

import React, { useState } from "react";
import {
  Clipboard,
  CheckCircle2,
  Plus,
  Settings,
  Swords,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const lobbyData = {
  accessCode: "842 913",
  maxPlayers: 4,
};

const commanders = [
  {
    id: 1,
    name: "Napoleon",
    avatarColor: "bg-sky-600",
    statusText: "READY TO PLAY",
    isHost: true,
    isReady: true,
  },
  {
    id: 2,
    name: "Alexander",
    avatarColor: "bg-rose-600",
    statusText: "READY TO PLAY",
    isHost: false,
    isReady: true,
    },
];

export default function LobbyPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const currentPlayers = commanders.length;
  const readyPlayers = commanders.filter((c) => c.isReady).length;
  const canStart = readyPlayers >= 2;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lobbyData.accessCode.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start pt-12 px-6 bg-[rgba(14,12,6,0.5)] overflow-hidden">
      
      <Card className="w-full max-w-2xl rounded-lg border border-[#FFD900]/15 bg-[rgba(14,12,6,0.9)] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#FFD900]/10">
          <div className="flex items-center gap-2">
            <Swords size={14} className="text-[#FFD900]/70" />
            <span className="font-audiowide text-[10px] tracking-[0.2em] text-white/60 uppercase">
              Conquest of Europe
            </span>
          </div>
          <button className="p-1 rounded-full border border-[rgba(255,217,0,0.2)] text-white/50 hover:text-[#FFD900] transition-colors cursor-pointer">
            <Settings size={14} />
          </button>
        </div>

        <CardContent className="flex flex-col gap-4 p-5">
          <div className="text-center">
            <h1 className="font-audiowide text-2xl font-bold tracking-wider text-white">
              GAME LOBBY
            </h1>
            <p className="text-[11px] text-white/40 tracking-widest uppercase mt-1">
              Waiting for commanders to assemble
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded border border-[#FFD900]/25 bg-[rgba(255,217,0,0.05)]">
            <div className="flex flex-col">
              <span className="font-audiowide text-[10px] tracking-widest text-[#FFD900]/50 uppercase">
                Access Code
              </span>
              <span className="font-audiowide text-3xl font-black text-[#FFD900] tracking-[0.15em]">
                {lobbyData.accessCode}
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

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end px-1">
              <h2 className="font-audiowide text-xs tracking-widest text-white/80 uppercase">
                Commanders ({currentPlayers}/{lobbyData.maxPlayers})
              </h2>
            </div>

            <div className="grid gap-2">
              {commanders.map((commander) => (
                <div
                  key={commander.id}
                  className="flex items-center justify-between px-4 py-2.5 rounded border border-[#FFD900]/10 bg-[rgba(255,217,0,0.02)]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded ${commander.avatarColor} flex items-center justify-center font-black text-white/90`}>
                      {commander.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-audiowide text-sm text-white">{commander.name}</span>
                        {commander.isHost && (
                          <span className="text-[8px] px-1.5 py-0.5 border border-[#FFD900]/30 text-[#FFD900]/70 uppercase font-audiowide">Host</span>
                        )}
                      </div>
                      <span className="font-audiowide text-[9px] text-[#38BDF8] tracking-tighter uppercase">
                        {commander.statusText}
                      </span>
                    </div>
                  </div>
                  {commander.isReady ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/20" />
                  )}
                </div>
              ))}

              {Array.from({ length: lobbyData.maxPlayers - currentPlayers }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded border border-dashed border-white/5 bg-transparent opacity-40">
                  <div className="w-9 h-9 rounded border border-dashed border-white/20 flex items-center justify-center text-white/20">
                    <Plus size={16} />
                  </div>
                  <span className="font-audiowide text-xs text-white/20 uppercase tracking-widest">Open Slot</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-row-reverse gap-3 mt-2">
            <Button
              disabled={!canStart}
              className={`flex-[3] h-12 font-audiowide tracking-[0.2em] transition-all cursor-pointer ${
                canStart
                  ? "bg-[#FFD900] text-[#0e0c06] shadow-[0_0_20px_rgba(255,217,0,0.2)] hover:shadow-[0_0_30px_rgba(255,217,0,0.4)]"
                  : "bg-white/5 text-white/20 border border-white/10"
              }`}
            >
              START CONQUEST
            </Button>
            
            <button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-2 px-6 h-12 font-audiowide text-xs tracking-widest uppercase rounded-md bg-transparent border border-red-500/30 text-red-400/70 hover:bg-red-500/8 hover:border-red-500/60 hover:text-red-400 hover:shadow-[0_0_16px_rgba(239,68,68,0.12)] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={14} className="rotate-180" />
              Leave
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}