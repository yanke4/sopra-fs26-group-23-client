"use client";

import { Swords } from "lucide-react";
import { useEffect, useState } from "react";

export const YourTurnToast = ({ show }: { show: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    setAnimating(true);

    const fadeOut = setTimeout(() => setAnimating(false), 2000);
    const hide = setTimeout(() => setVisible(false), 2400);

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div
        style={{
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: animating ? 1 : 0,
          transform: animating ? "scale(1)" : "scale(0.92)",
        }}
        className="flex flex-col items-center gap-3 bg-[#0f0d0b] border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/80 px-12 py-8"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-700/30 border border-amber-500/40">
          <Swords size={22} className="text-amber-400" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-amber-400/60 text-[10px] font-mono uppercase tracking-[0.2em]">
            Commander
          </span>
          <span className="text-amber-100 text-2xl font-bold font-mono uppercase tracking-widest">
            Your Turn
          </span>
        </div>
        <div className="h-px w-full bg-amber-900/40" />
        <span className="text-amber-200/50 text-xs font-mono uppercase tracking-wider">
          Deploy your troops
        </span>
      </div>
    </div>
  );
};