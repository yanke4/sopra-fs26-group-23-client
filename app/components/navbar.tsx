"use client";
import React, { useState, useRef, useEffect } from "react";
import { User, LogIn, UserPlus, Swords } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="relative flex items-center px-8 py-0 h-14 border-b border-[#FFD900]/10 bg-[rgba(14,12,6,0.75)] backdrop-blur-sm">
      <div className="flex-1">
        <span className="flex items-center gap-1 font-extrabold text-base uppercase text-[#FFD900] [text-shadow:0_0_12px_rgba(255,217,0,0.6),0_0_24px_rgba(255,217,0,0.2)]">
          <Swords
            size={18}
            className="filter-[drop-shadow(0_0_6px_rgba(255,217,0,0.8))_drop-shadow(0_0_12px_rgba(255,217,0,0.4))]"
          />
          <span className="tracking-tight font-audiowide">
            Conquest of Europe
          </span>
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
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="p-2 rounded-full cursor-pointer transition-all duration-200 border border-[rgba(255,217,0,0.4)] text-white hover:border-[#FFD900] hover:text-[#FFD900] hover:shadow-[0_0_10px_rgba(255,217,0,0.4)]"
          >
            <User size={18} />
          </div>

          <div
            className={`absolute right-0 mt-3 w-48 rounded-md border border-[#FFD900]/15 bg-[rgba(14,12,6,0.97)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_1px_rgba(255,217,0,0.1)] z-50 origin-top-right transition-all duration-200 ${
              dropdownOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="p-1.5">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/profile");
                }}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 hover:bg-[rgba(255,217,0,0.08)] cursor-pointer"
              >
                <div className="p-1.5 rounded border border-[#FFD900]/20 text-[#FFD900]/50 transition-all duration-200 group-hover:border-[#FFD900]/50 group-hover:text-[#FFD900] group-hover:shadow-[0_0_8px_rgba(255,217,0,0.15)]">
                  <User size={13} />
                </div>
                <span className="font-audiowide text-[11px] tracking-[0.15em] uppercase text-white/70 transition-all duration-200 group-hover:text-[#FFD900] group-hover:[text-shadow:0_0_10px_rgba(255,217,0,0.5)]">
                  Profile
                </span>
              </button>
              <div className="mx-3 my-0.5 h-px bg-linear-to-r from-transparent via-[#FFD900]/15 to-transparent" />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/login");
                }}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 hover:bg-[rgba(255,217,0,0.08)] cursor-pointer"
              >
                <div className="p-1.5 rounded border border-[#FFD900]/20 text-[#FFD900]/50 transition-all duration-200 group-hover:border-[#FFD900]/50 group-hover:text-[#FFD900] group-hover:shadow-[0_0_8px_rgba(255,217,0,0.15)]">
                  <LogIn size={13} />
                </div>
                <span className="font-audiowide text-[11px] tracking-[0.15em] uppercase text-white/70 transition-all duration-200 group-hover:text-[#FFD900] group-hover:[text-shadow:0_0_10px_rgba(255,217,0,0.5)]">
                  Log In
                </span>
              </button>

              <div className="mx-3 my-0.5 h-px bg-linear-to-r from-transparent via-[#FFD900]/15 to-transparent" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/register");
                }}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 hover:bg-[rgba(255,217,0,0.08)] cursor-pointer"
              >
                <div className="p-1.5 rounded border border-[#FFD900]/20 text-[#FFD900]/50 transition-all duration-200 group-hover:border-[#FFD900]/50 group-hover:text-[#FFD900] group-hover:shadow-[0_0_8px_rgba(255,217,0,0.15)]">
                  <UserPlus size={13} />
                </div>
                <span className="font-audiowide text-[11px] tracking-[0.15em] uppercase text-white/70 transition-all duration-200 group-hover:text-[#FFD900] group-hover:[text-shadow:0_0_10px_rgba(255,217,0,0.5)]">
                  Register
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
