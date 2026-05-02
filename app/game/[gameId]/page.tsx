"use client";

import GameView from "./GameView";
import { useGamePageController } from "./useGamePageController";

const GamePage = () => {
  const controller = useGamePageController();

  return <GameView {...controller} />;
};

export default GamePage;
