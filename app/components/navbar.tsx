"use client";
import React from "react";
import { User } from "lucide-react";
import { Swords } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="relative flex items-center px-8 py-0 h-14 border-b border-[#FFD900]/10 bg-[rgba(14,12,6,0.75)] backdrop-blur-sm">
      <div className="flex-1">
        <span className="font-extrabold text-base uppercase tracking-[0.2em] text-[#FFD900] [text-shadow:0_0_12px_rgba(255,217,0,0.6),0_0_24px_rgba(255,217,0,0.2)]">
          <Swords
            size={18}
            className="inline-block mr-1 filter-[drop-shadow(0_0_6px_rgba(255,217,0,0.8))_drop-shadow(0_0_12px_rgba(255,217,0,0.4))]"
          />
          Conquest of Europe
        </span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
        {["Home", "Leaderboard", "Settings"].map((label) => (
          <a
            key={label}
            href="#"
            className="relative px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-white group"
          >
            <span className="relative z-10 text-white transition-all duration-200 text-shadow-none group-hover:text-[#FFD900] group-hover:[text-shadow:0_0_8px_rgba(255,217,0,0.8)]">
              {label}
            </span>
            <span className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[rgba(255,217,0,0.05)]" />
          </a>
        ))}
      </div>

      <div className="flex-1 flex justify-end">
        <div className="p-2 rounded-full cursor-pointer transition-all duration-200 border border-[rgba(255,217,0,0.4)] text-white hover:border-[#FFD900] hover:text-[#FFD900] hover:shadow-[0_0_10px_rgba(255,217,0,0.4)]">
          <User size={18} />
        </div>
      </div>
    </nav>
  );
}
