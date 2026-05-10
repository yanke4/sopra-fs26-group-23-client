"use client";

import { useEffect, useRef, useState } from "react";

const TurnTimerBar = ({
  turnStartedAtMillis,
  turnTimerSeconds,
  accentColor,
}: {
  turnStartedAtMillis: number | null | undefined;
  turnTimerSeconds: number | null | undefined;
  accentColor: string;
}) => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!turnTimerSeconds || !turnStartedAtMillis) {
      setProgress(0);
      return;
    }
    const totalMs = turnTimerSeconds * 1000;
    const tick = () => {
      const elapsed = Math.max(0, Date.now() - turnStartedAtMillis);
      const pct = Math.max(0, Math.min(100, (elapsed / totalMs) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    tick();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [turnStartedAtMillis, turnTimerSeconds]);

  if (!turnTimerSeconds || !turnStartedAtMillis) return null;

  const urgent = progress > 75;

  return (
    <div className="relative h-1.5 w-full bg-black/60 border-b border-amber-900/30 overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 ${urgent ? "animate-pulse" : ""}`}
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${accentColor}cc 0%, ${accentColor} 100%)`,
          boxShadow: `0 0 14px ${accentColor}, 0 0 4px ${accentColor}`,
        }}
      />
    </div>
  );
};

export default TurnTimerBar;
