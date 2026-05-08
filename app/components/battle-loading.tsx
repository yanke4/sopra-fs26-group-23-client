"use client";

import { Swords } from "lucide-react";
import { useEffect, useState } from "react";

const QUOTES = [
  { text: "Veni, vidi, vici.", author: "Julius Caesar" },
  { text: "Fortune favors the bold.", author: "Virgil" },
  { text: "Know your enemy and know yourself.", author: "Sun Tzu" },
  { text: "Si vis pacem, para bellum.", author: "Vegetius" },
  { text: "He who defends everything defends nothing.", author: "Frederick the Great" },
  { text: "The supreme art of war is to subdue the enemy without fighting.", author: "Sun Tzu" },
  { text: "Audaces fortuna iuvat.", author: "Roman Proverb" },
  { text: "Empires rise on the courage of the few.", author: "Anonymous" },
  { text: "In war, the simplest things become difficult.", author: "Clausewitz" },
];

export default function BattleLoading({
  message = "Forging the battlefield",
}: {
  message?: string;
}) {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const quote = QUOTES[quoteIndex];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0908] overflow-hidden">
      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,217,0,0.42) 0%, transparent 70%)",
          animation: "battle-glow-drift 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[520px] h-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,217,0,0.22) 0%, transparent 70%)",
          animation: "battle-glow-drift-rev 18s ease-in-out infinite",
          animationDelay: "-4s",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,217,0,0.4) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, rgba(255,217,0,0.4) 0 1px, transparent 1px 14px)",
          animation: "battle-grid-pulse 6s ease-in-out infinite",
        }}
      />

      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const left = (i * 14 + 8) % 100;
        const duration = 9 + (i % 4) * 1.4;
        const delay = -((i * 2.1) % 9);
        const size = i % 3 === 0 ? 3 : 2;
        return (
          <span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${left}%`,
              bottom: 0,
              width: size,
              height: size,
              background: "#FFD900",
              boxShadow:
                "0 0 6px rgba(255,217,0,0.7), 0 0 12px rgba(255,217,0,0.35)",
              animation: `battle-ember-rise ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      <div className="relative flex flex-col items-center gap-7 px-6 max-w-xl">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-50 rounded-full bg-[#FFD900]" />
          <div className="relative rounded-full p-6 border border-[#FFD900]/40 phase-hint-brand">
            <Swords
              size={56}
              className="relative text-[#FFD900]"
              strokeWidth={1.4}
            />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="font-audiowide text-3xl md:text-4xl tracking-[0.3em] text-[#FFD900] uppercase drop-shadow-[0_0_18px_rgba(255,217,0,0.4)]">
            Prepare for Battle
          </h1>
          <div className="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-[#FFD900]/70 to-transparent" />
          <p className="font-audiowide text-[10px] tracking-[0.4em] text-[#FFD900]/55 uppercase">
            {message}
          </p>
        </div>

        <div className="text-center min-h-[4em] flex flex-col items-center justify-center px-4">
          <p
            key={quoteIndex}
            className="italic text-sm md:text-base leading-relaxed text-[#FFD900]/85 animate-in fade-in slide-in-from-bottom-1 duration-700"
          >
            &ldquo;{quote.text}&rdquo;
          </p>
          <p
            key={`a-${quoteIndex}`}
            className="font-audiowide text-[9px] tracking-[0.3em] uppercase mt-2 text-[#FFD900]/45 animate-in fade-in duration-1000"
          >
            — {quote.author}
          </p>
        </div>

        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#FFD900",
                animation: "battle-dot 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
