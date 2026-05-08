"use client";

import { useEffect, useState } from "react";
import BattleLoading from "@/components/battle-loading";
import GameView from "./GameView";
import { useGamePageController } from "./useGamePageController";

const MIN_LOADING_MS = 5000;

const GamePage = () => {
  const controller = useGamePageController();

  const [showBattleLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    const flag = sessionStorage.getItem("battleLoading");
    if (!flag) return false;
    sessionStorage.removeItem("battleLoading");
    return true;
  });
  const [minDelayElapsed, setMinDelayElapsed] = useState(!showBattleLoading);

  useEffect(() => {
    if (!showBattleLoading) return;
    const id = setTimeout(() => setMinDelayElapsed(true), MIN_LOADING_MS);
    return () => clearTimeout(id);
  }, [showBattleLoading]);

  if (showBattleLoading && (!controller.gameState || !minDelayElapsed)) {
    return <BattleLoading />;
  }

  return <GameView {...controller} />;
};

export default GamePage;
