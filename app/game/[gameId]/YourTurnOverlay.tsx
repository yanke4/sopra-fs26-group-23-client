"use client";

import { Swords, Shield } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        style={{
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: animating ? 1 : 0,
          transform: animating ? "scale(1)" : "scale(0.92)",
        }}
        className="flex flex-col items-center gap-3 bg-[#0f0d0b] border border-[#FFD900]/40 rounded-2xl shadow-2xl shadow-black/80 px-12 py-8"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD900]/15 border border-[#FFD900]/40">
          <Swords size={22} className="text-[#FFD900]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[#FFD900]/60 text-[10px] font-audiowide uppercase tracking-[0.3em]">
            Commander
          </span>
          <span className="text-[#FFD900] text-2xl font-audiowide font-bold uppercase tracking-widest">
            Your Turn
          </span>
        </div>
        <div className="h-px w-full bg-[#FFD900]/30" />
        <span className="text-[#FFD900]/50 text-xs font-audiowide uppercase tracking-wider">
          Deploy your troops
        </span>
      </div>
    </div>
  );
};

export const PhaseTransitionToast = ({
  show,
  phase,
}: {
  show: boolean;
  phase: "attack" | "fortify";
}) => {
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

  const isAttack = phase === "attack";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        style={{
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: animating ? 1 : 0,
          transform: animating ? "scale(1)" : "scale(0.92)",
        }}
        className="flex flex-col items-center gap-3 bg-[#0f0d0b] border border-[#FFD900]/40 rounded-2xl shadow-2xl shadow-black/80 px-12 py-8"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD900]/15 border border-[#FFD900]/40">
          {isAttack ? (
            <Swords size={22} className="text-[#FFD900]" />
          ) : (
            <Shield size={22} className="text-[#FFD900]" />
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[#FFD900]/60 text-[10px] font-audiowide uppercase tracking-[0.3em]">
            Commander
          </span>
          <span className="text-[#FFD900] text-2xl font-audiowide font-bold uppercase tracking-widest">
            {isAttack ? "Attack Phase" : "Fortify Phase"}
          </span>
        </div>
        <div className="h-px w-full bg-[#FFD900]/30" />
        <span className="text-[#FFD900]/50 text-xs font-audiowide uppercase tracking-wider">
          {isAttack ? "Conquer enemy territories" : "Secure your borders"}
        </span>
      </div>
    </div>
  );
};