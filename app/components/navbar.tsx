"use client";
import React, { useState, useRef, useEffect } from "react";
import { User, LogIn, UserPlus, Swords, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wide, setWide] = useState(true);
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

  useEffect(() => {
    const update = () => setWide(window.innerWidth >= 900);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 flex items-center px-4 sm:px-8 py-0 h-14 border-b border-[#FFD900]/10 bg-[rgba(14,12,6,0.75)] backdrop-blur-sm">
      <div className="flex-1">
        <a
          href="/"
          className="flex items-center gap-1 font-extrabold text-base uppercase text-[#FFD900] [text-shadow:0_0_12px_rgba(255,217,0,0.6),0_0_24px_rgba(255,217,0,0.2)]"
        >
          <Swords
            size={18}
            className="text-[#FFD900] filter-[drop-shadow(0_0_6px_rgba(255,217,0,0.8))_drop-shadow(0_0_12px_rgba(255,217,0,0.4))]"
          />
          {wide && (
            <span className="tracking-tight font-audiowide text-xs sm:text-base text-[#FFD900] [text-shadow:0_0_12px_rgba(255,217,0,0.6),0_0_24px_rgba(255,217,0,0.2)]">
              Conquest of Europe
            </span>
          )}
        </a>
      </div>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
        {navLinks.map(({ label, path }) => (
          <a
            key={label}
            href={path}
            className="relative px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-white group"
          >
            <span className="relative z-10 text-white transition-all duration-200 text-shadow-none group-hover:text-[#FFD900] group-hover:[text-shadow:0_0_8px_rgba(255,217,0,0.8)]">
              {label}
            </span>
            <span className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[rgba(255,217,0,0.05)]" />
          </a>
        ))}
      </div>

      <div className="flex-1 flex justify-end items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="p-2 rounded-full cursor-pointer transition-all duration-200 border border-[rgba(255,217,0,0.4)] text-white hover:border-[#FFD900] hover:text-[#FFD900] hover:shadow-[0_0_10px_rgba(255,217,0,0.4)]"
          >
            <User size={18} />
          </div>

          <div
            className={`absolute right-0 mt-3 w-52 rounded-lg border border-[#FFD900]/20 bg-[rgba(14,12,6,0.95)] backdrop-blur-xl shadow-[0_12px_48px_rgba(0,0,0,0.7),0_0_1px_rgba(255,217,0,0.15)] z-50 origin-top-right transition-all duration-200 overflow-hidden ${
              dropdownOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="px-3 py-2.5 border-b border-[#FFD900]/10">
              <span className="font-audiowide text-[10px] tracking-[0.2em] uppercase text-[#FFD900]/40">
                Account
              </span>
            </div>
            <div className="p-1.5 flex flex-col gap-0.5">
              {[
                { icon: User, label: "Profile", path: "/profile" },
                { icon: LogIn, label: "Log In", path: "/login" },
                { icon: UserPlus, label: "Register", path: "/register" },
              ].map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push(path);
                  }}
                  className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-md bg-transparent border-none outline-none cursor-pointer transition-all duration-200 hover:bg-[rgba(255,217,0,0.08)] active:scale-[0.98]"
                >
                  <Icon
                    size={15}
                    className="text-[#FFD900]/40 transition-all duration-200 group-hover:text-[#FFD900] group-hover:filter-[drop-shadow(0_0_6px_rgba(255,217,0,0.5))]"
                  />
                  <span className="font-audiowide text-[11px] tracking-[0.15em] uppercase text-white/60 transition-all duration-200 group-hover:text-white group-hover:[text-shadow:0_0_10px_rgba(255,217,0,0.3)]">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          className="md:hidden p-2 rounded-full cursor-pointer transition-all duration-200 border border-[rgba(255,217,0,0.4)] bg-transparent text-white hover:border-[#FFD900] hover:text-[#FFD900] hover:shadow-[0_0_10px_rgba(255,217,0,0.4)]"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        className={`absolute top-14 left-0 right-0 md:hidden border-b border-[#FFD900]/20 bg-[rgba(14,12,6,0.95)] backdrop-blur-xl shadow-[0_12px_48px_rgba(0,0,0,0.7),0_0_1px_rgba(255,217,0,0.15)] z-40 transition-all duration-200 overflow-hidden ${
          menuOpen
            ? "max-h-80 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-2.5 border-b border-[#FFD900]/10">
          <span className="font-audiowide text-[10px] tracking-[0.2em] uppercase text-[#FFD900]/40">
            Navigation
          </span>
        </div>
        <div className="p-1.5 flex flex-col gap-0.5">
          {navLinks.map(({ label, path }) => (
            <button
              key={label}
              onClick={() => { setMenuOpen(false); router.push(path); }}
              className="group flex items-center gap-3 w-full px-4 py-3 rounded-md bg-transparent border-none outline-none cursor-pointer transition-all duration-200 hover:bg-[rgba(255,217,0,0.08)] active:scale-[0.98]"
            >
              <span className="font-audiowide text-[11px] tracking-[0.15em] uppercase text-white/60 transition-all duration-200 group-hover:text-white group-hover:[text-shadow:0_0_10px_rgba(255,217,0,0.3)]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
