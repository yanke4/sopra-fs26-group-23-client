"use client";

import { useEffect, useState } from "react";
import BattleLoading from "@/components/battle-loading";
import GameView from "./GameView";
import { useGamePageController } from "./useGamePageController";

const MIN_LOADING_MS = 5000;

const GamePage = () => {
  const controller = useGamePageController();
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMinDelayElapsed(true), MIN_LOADING_MS);
    return () => clearTimeout(id);
  }, []);

  if (!controller.gameState || !minDelayElapsed) {
    return <BattleLoading />;
  }

  return <GameView {...controller} />;
};

export default GamePage;
