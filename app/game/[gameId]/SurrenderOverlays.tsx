"use client";

import { Flag } from "lucide-react";

export const SurrenderToast = ({ message }: { message: string | null }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-900/90 border border-red-500/50 text-red-100 px-5 py-2.5 rounded-lg shadow-xl shadow-black/50 text-sm font-semibold">
      <Flag size={14} className="text-red-400 shrink-0" />
      {message}
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
