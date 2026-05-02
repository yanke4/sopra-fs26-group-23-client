"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Swords,
  Crown,
  ChevronRight,
  Skull,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* -------------------- Decorative atoms -------------------- */

function GoldDivider({ icon: Icon = Swords }: { icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="flex items-center gap-3 w-full max-w-sm">
      <div className="flex-1 h-px bg-linear-to-r from-transparent to-[#FFD900]/40" />
      <Icon size={14} className="text-[#FFD900]/50" />
      <div className="flex-1 h-px bg-linear-to-l from-transparent to-[#FFD900]/40" />
    </div>
  );
}

function StepLabel({ n, total }: { n: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-audiowide text-[44px] sm:text-[56px] leading-none text-[#FFD900] [text-shadow:0_0_24px_rgba(255,217,0,0.45)]">
        {String(n).padStart(2, "0")}
      </span>
      <div className="flex flex-col leading-tight pt-1">
        <span className="font-audiowide text-[9px] tracking-[0.4em] uppercase text-[#FFD900]/40">
          Chapter
        </span>
        <span className="font-audiowide text-[10px] tracking-[0.3em] uppercase text-white/40">
          {n} of {total}
        </span>
      </div>
    </div>
  );
}

/* Dice face — actual SVG, gold pips */
function DiceFace({
  value,
  variant = "attacker",
  size = 72,
}: {
  value: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "attacker" | "defender" | "muted";
  size?: number;
}) {
  const positions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[26, 26], [50, 50], [74, 74]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
    6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
  };

  const palette =
    variant === "attacker"
      ? { bg: "#1a0a0a", border: "rgba(255,80,80,0.55)", pip: "#ff8a8a", glow: "rgba(255,80,80,0.35)" }
      : variant === "defender"
        ? { bg: "#0a0f1a", border: "rgba(140,180,255,0.55)", pip: "#bcd5ff", glow: "rgba(140,180,255,0.35)" }
        : { bg: "#14110a", border: "rgba(255,217,0,0.4)", pip: "#FFD900", glow: "rgba(255,217,0,0.3)" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ filter: `drop-shadow(0 0 12px ${palette.glow})` }}
    >
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="14"
        fill={palette.bg}
        stroke={palette.border}
        strokeWidth="2"
      />
      {positions[value].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6" fill={palette.pip} />
      ))}
    </svg>
  );
}

/* Hex territory tile with troop pips */
function HexTerritory({
  troops,
  label,
  highlight = false,
}: {
  troops: number;
  label: string;
  highlight?: boolean;
}) {
  const stroke = highlight ? "rgba(255,217,0,0.7)" : "rgba(255,217,0,0.25)";
  const fill = highlight ? "rgba(255,217,0,0.08)" : "rgba(14,12,6,0.7)";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="120"
        height="138"
        viewBox="0 0 120 138"
        style={{ filter: highlight ? "drop-shadow(0 0 18px rgba(255,217,0,0.25))" : undefined }}
      >
        <polygon
          points="60,4 114,34 114,104 60,134 6,104 6,34"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
        <text
          x="60"
          y="56"
          textAnchor="middle"
          fontFamily="Audiowide, sans-serif"
          fontSize="9"
          letterSpacing="2"
          fill={highlight ? "#FFD900" : "rgba(255,217,0,0.55)"}
        >
          {label.toUpperCase()}
        </text>
        <circle cx="60" cy="84" r="20" fill="rgba(255,217,0,0.1)" stroke={stroke} />
        <text
          x="60"
          y="92"
          textAnchor="middle"
          fontFamily="Audiowide, sans-serif"
          fontSize="20"
          fill={highlight ? "#FFD900" : "rgba(255,255,255,0.85)"}
        >
          {troops}
        </text>
      </svg>
    </div>
  );
}

/* Troop pip row */
function TroopPips({ count, color = "#FFD900" }: { count: number; color?: string }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="w-3 h-3 rounded-sm rotate-45"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}aa`,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------- Page -------------------- */

export default function HowToPlay() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 px-4 sm:px-8 pb-24">
      <div className="w-full max-w-6xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        {/* ============ HERO ============ */}
        <section className="relative grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-center mb-20 py-8">
          <div className="flex flex-col gap-5">
            <span className="font-audiowide text-[10px] tracking-[0.4em] text-[#FFD900]/60 uppercase border border-[#FFD900]/20 px-4 py-1.5 rounded-full self-start">
              Field Manual · v1.0
            </span>
            <h1 className="text-5xl sm:text-7xl font-audiowide font-bold leading-[0.95] tracking-wider text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
              HOW TO
              <br />
              <span className="text-[#FFD900] [text-shadow:0_0_30px_rgba(255,217,0,0.5),0_0_60px_rgba(255,217,0,0.2)]">
                CONQUER
              </span>
              <span className="text-white/85"> EUROPE</span>
            </h1>
            <p className="text-base text-white/55 max-w-lg leading-relaxed">
              Five chapters separate a recruit from a ruler. Read fast — your
              rivals already are.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Setup", "Deploy", "Attack", "Conquer"].map((t, i) => (
                <span
                  key={t}
                  className="font-audiowide text-[9px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-sm border border-[#FFD900]/15 text-white/50"
                  style={{ background: `rgba(255,217,0,${0.02 + i * 0.015})` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero illustration: stacked dice tower */}
          <div className="relative flex items-center justify-center min-h-[280px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,217,0,0.08)_0%,transparent_70%)]" />
            <div className="relative grid grid-cols-3 gap-3 rotate-[-6deg]">
              <div className="translate-y-3"><DiceFace value={3} variant="attacker" /></div>
              <div className="-translate-y-2"><DiceFace value={6} variant="muted" size={84} /></div>
              <div className="translate-y-4"><DiceFace value={5} variant="defender" /></div>
              <div className="-translate-y-1"><DiceFace value={2} variant="defender" /></div>
              <div className="translate-y-2"><DiceFace value={4} variant="attacker" size={84} /></div>
              <div className="-translate-y-3"><DiceFace value={1} variant="muted" /></div>
            </div>
          </div>
        </section>

        {/* ============ STEP 01 — PLAYERS ============ */}
        <section className="mb-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6 border-b border-[#FFD900]/15 pb-4">
            <StepLabel n={1} total={5} />
            <span className="font-audiowide text-[10px] tracking-[0.3em] uppercase text-[#FFD900]/50">
              Gather the Generals
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 items-center">
            <div>
              <h2 className="font-audiowide text-3xl sm:text-4xl tracking-wide text-white mb-4">
                A war needs <span className="text-[#FFD900]">enemies</span>.
              </h2>
              <p className="text-white/55 leading-relaxed text-[15px]">
                Every campaign begins in the lobby. Bring a friend for a duel,
                or fill the room and let four ambitions tear the map apart.
              </p>
              <p className="mt-3 text-white/40 text-sm leading-relaxed italic">
                More players, more borders, more betrayals.
              </p>
            </div>

            {/* Players row visualization */}
            <div className="relative">
              <div className="flex items-end justify-around gap-3 px-4 py-8 rounded-md border border-[#FFD900]/15 bg-[rgba(14,12,6,0.6)] backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#FFD900]/30 to-transparent" />
                {[
                  { color: "#FFD900", on: true, name: "P1" },
                  { color: "#ff6b6b", on: true, name: "P2" },
                  { color: "#6bb6ff", on: true, name: "P3" },
                  { color: "#9d6bff", on: true, name: "P4" },
                ].map((p, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2"
                      style={{
                        borderColor: p.color,
                        background: `radial-gradient(circle at 30% 30%, ${p.color}33, transparent 70%)`,
                        boxShadow: `0 0 18px ${p.color}55, inset 0 0 12px ${p.color}22`,
                      }}
                    >
                      <User size={20} style={{ color: p.color }} />
                    </div>
                    <span
                      className="font-audiowide text-[10px] tracking-widest"
                      style={{ color: `${p.color}cc` }}
                    >
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between font-audiowide text-[10px] tracking-[0.3em] uppercase">
                <span className="text-white/40">Min · 2 Players</span>
                <span className="text-[#FFD900]/70">Max · 4 Players</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STEP 02 — SETUP ============ */}
        <section className="mb-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6 border-b border-[#FFD900]/15 pb-4">
            <StepLabel n={2} total={5} />
            <span className="font-audiowide text-[10px] tracking-[0.3em] uppercase text-[#FFD900]/50">
              Stake Your Claim
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            {/* Two hex territories with troop split visualization */}
            <div className="relative rounded-md border border-[#FFD900]/15 bg-[rgba(14,12,6,0.6)] backdrop-blur-sm p-8">
              <div className="absolute top-3 left-4 font-audiowide text-[9px] tracking-[0.3em] uppercase text-[#FFD900]/40">
                Opening Position
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                <HexTerritory troops={3} label="North" highlight />
                <div className="flex flex-col items-center gap-2 text-[#FFD900]/40">
                  <Plus size={20} />
                </div>
                <HexTerritory troops={2} label="South" />
              </div>

              <div className="mt-6 pt-5 border-t border-[#FFD900]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-audiowide text-[10px] tracking-[0.3em] uppercase text-white/45">
                    Your Battalion
                  </span>
                  <span className="font-audiowide text-[11px] tracking-widest text-[#FFD900]">
                    5 Troops
                  </span>
                </div>
                <TroopPips count={5} />
                <p className="mt-3 text-xs text-white/40 italic">
                  Distribute them however you wish — concentrate the spear, or
                  spread the shield.
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-audiowide text-3xl sm:text-4xl tracking-wide text-white mb-4">
                Two lands. <span className="text-[#FFD900]">Five blades.</span>
              </h2>
              <p className="text-white/55 leading-relaxed text-[15px]">
                The moment the lobby starts, the dice of fate carve out{" "}
                <span className="text-[#FFD900]/85">two territories</span> for
                you and hand you a battalion of{" "}
                <span className="text-[#FFD900]/85">five troops</span> to split
                between them.
              </p>
              <p className="mt-3 text-white/40 text-sm leading-relaxed">
                Where you stack your forces is your first decision — and often
                the one rivals remember longest.
              </p>
            </div>
          </div>
        </section>

        {/* ============ STEP 03 — REINFORCEMENTS ============ */}
        <section className="mb-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6 border-b border-[#FFD900]/15 pb-4">
            <StepLabel n={3} total={5} />
            <span className="font-audiowide text-[10px] tracking-[0.3em] uppercase text-[#FFD900]/50">
              Round Reinforcements
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            <div className="flex flex-col justify-center">
              <h2 className="font-audiowide text-3xl sm:text-4xl tracking-wide text-white mb-4">
                Every dawn brings <span className="text-[#FFD900]">steel</span>.
              </h2>
              <p className="text-white/55 leading-relaxed text-[15px]">
                At the start of each round you collect{" "}
                <span className="text-[#FFD900]/85">at least 4 troops</span> to
                deploy where you please. Hold an entire bonus region and the
                continent rewards your dominance with{" "}
                <span className="text-[#FFD900]/85">extra reinforcements</span>{" "}
                — momentum that compounds into empire.
              </p>
            </div>

            {/* Equation-style reinforcement breakdown */}
            <div className="rounded-md border border-[#FFD900]/15 bg-[rgba(14,12,6,0.6)] backdrop-blur-sm p-6 sm:p-8">
              <span className="font-audiowide text-[9px] tracking-[0.3em] uppercase text-[#FFD900]/40">
                Round Income
              </span>

              <div className="mt-5 flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="flex flex-col items-center px-4 py-3 rounded-md border border-[#FFD900]/30 bg-[rgba(255,217,0,0.05)] min-w-[88px]">
                  <span className="font-audiowide text-3xl text-[#FFD900] [text-shadow:0_0_12px_rgba(255,217,0,0.4)]">
                    +4
                  </span>
                  <span className="font-audiowide text-[9px] tracking-widest uppercase text-white/45 mt-1">
                    Base
                  </span>
                </div>

                <Plus size={18} className="text-[#FFD900]/40" />

                <div className="flex flex-col items-center px-4 py-3 rounded-md border border-dashed border-[#FFD900]/25 bg-[rgba(255,217,0,0.02)] min-w-[88px]">
                  <span className="font-audiowide text-3xl text-white/80">
                    +N
                  </span>
                  <span className="font-audiowide text-[9px] tracking-widest uppercase text-white/45 mt-1">
                    Region Bonus
                  </span>
                </div>

                <span className="font-audiowide text-2xl text-[#FFD900]/40">=</span>

                <div className="flex flex-col items-center px-5 py-3 rounded-md bg-[#FFD900] text-[#0e0c06] shadow-[0_0_24px_rgba(255,217,0,0.3)]">
                  <span className="font-audiowide text-3xl">ARMY</span>
                  <span className="font-audiowide text-[9px] tracking-widest uppercase mt-1 opacity-70">
                    Yours to deploy
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#FFD900]/10 grid grid-cols-3 gap-3">
                {[
                  { region: "Iberia", bonus: "+2" },
                  { region: "Britannia", bonus: "+3" },
                  { region: "Balkans", bonus: "+5" },
                ].map((r) => (
                  <div
                    key={r.region}
                    className="text-center px-2 py-2 rounded-sm border border-[#FFD900]/10 bg-[rgba(255,217,0,0.02)]"
                  >
                    <div className="font-audiowide text-[9px] tracking-widest uppercase text-white/45">
                      {r.region}
                    </div>
                    <div className="font-audiowide text-sm text-[#FFD900]/80 mt-0.5">
                      {r.bonus}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-white/35 italic text-center">
                Sample bonuses — full a region, claim its tribute.
              </p>
            </div>
          </div>
        </section>

        {/* ============ STEP 04 — DICE COMBAT ============ */}
        <section className="mb-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6 border-b border-[#FFD900]/15 pb-4">
            <StepLabel n={4} total={5} />
            <span className="font-audiowide text-[10px] tracking-[0.3em] uppercase text-[#FFD900]/50">
              Roll for War
            </span>
          </div>

          <div className="rounded-md border border-[#FFD900]/15 bg-[rgba(14,12,6,0.6)] backdrop-blur-sm overflow-hidden">
            <div className="p-6 sm:p-8 text-center border-b border-[#FFD900]/10">
              <h2 className="font-audiowide text-3xl sm:text-4xl tracking-wide text-white">
                Steel meets <span className="text-[#FFD900]">fortune</span>.
              </h2>
              <p className="mt-3 text-white/55 max-w-2xl mx-auto leading-relaxed text-[15px]">
                Combat plays out exactly like the classic board game. Both sides
                roll their dice, the highest values are matched, and{" "}
                <span className="text-[#FFD900]/85">ties favour the defender</span>.
              </p>
            </div>

            {/* Showdown */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 p-8 items-center">
              {/* Attacker */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Swords size={14} className="text-[#ff8a8a]" />
                  <span className="font-audiowide text-xs tracking-[0.3em] uppercase text-[#ff8a8a]">
                    Attacker
                  </span>
                </div>
                <div className="flex gap-3">
                  <DiceFace value={6} variant="attacker" size={64} />
                  <DiceFace value={4} variant="attacker" size={64} />
                  <DiceFace value={2} variant="attacker" size={64} />
                </div>
                <span className="font-audiowide text-[10px] tracking-widest uppercase text-white/40">
                  Up to 3 dice
                </span>
              </div>

              {/* VS column */}
              <div className="flex flex-col items-center gap-2">
                <div className="hidden md:block w-px h-16 bg-linear-to-b from-transparent via-[#FFD900]/40 to-transparent" />
                <span className="font-audiowide text-2xl text-[#FFD900] [text-shadow:0_0_18px_rgba(255,217,0,0.5)]">
                  VS
                </span>
                <div className="hidden md:block w-px h-16 bg-linear-to-b from-transparent via-[#FFD900]/40 to-transparent" />
              </div>

              {/* Defender */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-audiowide text-xs tracking-[0.3em] uppercase text-[#bcd5ff]">
                    Defender
                  </span>
                </div>
                <div className="flex gap-3">
                  <DiceFace value={5} variant="defender" size={64} />
                  <DiceFace value={4} variant="defender" size={64} />
                </div>
                <span className="font-audiowide text-[10px] tracking-widest uppercase text-white/40">
                  Up to 2 dice
                </span>
              </div>
            </div>

            {/* Resolution row */}
            <div className="grid grid-cols-2 border-t border-[#FFD900]/10">
              <div className="p-4 sm:p-5 text-center border-r border-[#FFD900]/10">
                <span className="font-audiowide text-[9px] tracking-[0.3em] uppercase text-white/40">
                  6 vs 5
                </span>
                <div className="font-audiowide text-sm text-[#ff8a8a] mt-1">
                  Attacker wins
                </div>
              </div>
              <div className="p-4 sm:p-5 text-center">
                <span className="font-audiowide text-[9px] tracking-[0.3em] uppercase text-white/40">
                  4 vs 4
                </span>
                <div className="font-audiowide text-sm text-[#bcd5ff] mt-1">
                  Tie · Defender wins
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STEP 05 — VICTORY ============ */}
        <section className="mb-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6 border-b border-[#FFD900]/15 pb-4">
            <StepLabel n={5} total={5} />
            <span className="font-audiowide text-[10px] tracking-[0.3em] uppercase text-[#FFD900]/50">
              Last One Standing
            </span>
          </div>

          <div className="relative rounded-md border border-[#FFD900]/25 bg-linear-to-br from-[rgba(28,24,8,0.7)] to-[rgba(14,12,6,0.6)] backdrop-blur-sm p-8 sm:p-12 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,217,0,0.12)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-5 rounded-full border-2 border-[#FFD900] shadow-[0_0_36px_rgba(255,217,0,0.45),inset_0_0_24px_rgba(255,217,0,0.18)]">
                  <Crown size={48} className="text-[#FFD900] [filter:drop-shadow(0_0_10px_rgba(255,217,0,0.6))]" />
                </div>
                <span className="font-audiowide text-[10px] tracking-[0.4em] uppercase text-[#FFD900]/70">
                  Sole Survivor
                </span>
              </div>

              <div>
                <h2 className="font-audiowide text-3xl sm:text-4xl tracking-wide text-white mb-3">
                  Outlast them <span className="text-[#FFD900]">all</span>.
                </h2>
                <p className="text-white/60 leading-relaxed text-[15px] max-w-xl">
                  Victory isn&apos;t measured in territory but in survival. When
                  every other commander has been wiped from the map,{" "}
                  <span className="text-[#FFD900]/90">
                    the last banner flying inherits the continent
                  </span>
                  .
                </p>

                <div className="mt-6 flex items-center gap-2 flex-wrap">
                  {[
                    { c: "#ff6b6b", out: true },
                    { c: "#6bb6ff", out: true },
                    { c: "#9d6bff", out: true },
                    { c: "#FFD900", out: false },
                  ].map((p, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition ${
                            p.out ? "opacity-30 grayscale" : ""
                          }`}
                          style={{
                            borderColor: p.c,
                            background: `radial-gradient(circle at 30% 30%, ${p.c}33, transparent 70%)`,
                            boxShadow: p.out ? "none" : `0 0 18px ${p.c}88`,
                          }}
                        >
                          {p.out ? (
                            <Skull size={14} style={{ color: p.c }} />
                          ) : (
                            <Crown size={14} style={{ color: p.c }} />
                          )}
                        </div>
                      </div>
                      {i < 3 && <ChevronRight size={14} className="text-[#FFD900]/30" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <div className="flex flex-col items-center gap-6 py-12 border-t border-[#FFD900]/10">
          <GoldDivider />
          <p className="font-audiowide text-xs sm:text-sm tracking-[0.3em] uppercase text-white/55 text-center">
            The map is drawn. The dice are warm.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push("/lobby")}
              className="px-9 py-3 font-audiowide text-sm tracking-widest uppercase rounded-md bg-[#FFD900] text-[#0e0c06] font-bold border-none shadow-[0_0_24px_rgba(255,217,0,0.3)] hover:bg-[#ffe44d] hover:shadow-[0_0_36px_rgba(255,217,0,0.55)] active:scale-95 cursor-pointer"
            >
              Create Lobby
              <ChevronRight size={16} className="ml-1" />
            </Button>
            <Button
              onClick={() => router.push("/joinLobby")}
              className="px-9 py-3 font-audiowide text-sm tracking-widest uppercase rounded-md bg-transparent border border-[#FFD900]/40 text-[#FFD900] hover:bg-[#FFD900]/8 hover:border-[#FFD900] hover:text-[#FFD900] hover:shadow-[0_0_20px_rgba(255,217,0,0.15)] active:scale-95 cursor-pointer"
            >
              Join Lobby
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
