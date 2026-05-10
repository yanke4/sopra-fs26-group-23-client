"use client";

import { Flag, Timer } from "lucide-react";
import { useEffect, useState } from "react";

export const SurrenderToast = ({ message }: { message: string | null }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-900/90 border border-red-500/50 text-red-100 px-5 py-2.5 rounded-lg shadow-xl shadow-black/50 text-sm font-semibold">
      <Flag size={14} className="text-red-400 shrink-0" />
      {message}
    </div>
  );
};

export const TurnTimeoutPopup = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    setAnimating(true);

    const fadeOut = setTimeout(() => setAnimating(false), 3200);
    const hide = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3700);

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [show, onClose]);

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
          <Timer size={22} className="text-[#FFD900]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[#FFD900]/60 text-[10px] font-audiowide uppercase tracking-[0.3em]">
            Turn Timer
          </span>
          <span className="text-[#FFD900] text-2xl font-audiowide font-bold uppercase tracking-widest">
            Time&apos;s up
          </span>
        </div>
        <div className="h-px w-full bg-[#FFD900]/30" />
        <span className="text-[#FFD900]/50 text-xs font-audiowide uppercase tracking-wider">
          Passed to next player
        </span>
      </div>
    </div>
  );
};

export const SurrenderModal = ({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative z-10 bg-[#0f0d0b] border border-amber-900/50 rounded-xl shadow-2xl shadow-black/80 p-6 w-80 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-900/40 border border-red-500/30">
          <Flag size={16} className="text-red-400" />
        </div>
        <h2 className="text-amber-100 font-bold text-base uppercase tracking-wide font-mono">
          Surrender?
        </h2>
      </div>
      <p className="text-amber-200/60 text-sm leading-relaxed">
        Are you sure you want to surrender? You will be eliminated and your
        territories will be lost.
      </p>
      <div className="h-px bg-amber-900/30" />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide border border-amber-900/40 bg-white/5 text-amber-200/60 hover:bg-white/10 hover:text-amber-200 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide border border-red-500/30 bg-red-900/40 text-red-300 hover:bg-red-800/50 hover:text-red-200 transition-all cursor-pointer"
        >
          Surrender
        </button>
      </div>
    </div>
  </div>
);
