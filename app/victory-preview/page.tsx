"use client";

import VictoryScreen from "@/components/victory-screen";
import type { TroopSnapshot } from "@/components/victory-screen";
import type { GameStateDTO } from "@/types/game";

const mockGameState: GameStateDTO = {
  gameId: 1,
  status: "FINISHED",
  currentPlayerIndex: 0,
  currentPlayerId: 1,
  currentPhase: "ATTACK",
  players: [
    { playerId: 1, userId: 99, username: "Napoleon", color: "RED", alive: true, troopCount: 42 },
    { playerId: 2, userId: 100, username: "Caesar", color: "BLUE", alive: false, troopCount: 0 },
    { playerId: 3, userId: 101, username: "Alexander", color: "GREEN", alive: false, troopCount: 0 },
    { playerId: 4, userId: 102, username: "Genghis", color: "YELLOW", alive: false, troopCount: 0 },
  ],
  fields: [
    { fieldName: "France", ownerPlayerId: 1, troops: 8 },
    { fieldName: "Germany", ownerPlayerId: 1, troops: 6 },
    { fieldName: "Spain", ownerPlayerId: 1, troops: 5 },
    { fieldName: "Italy", ownerPlayerId: 1, troops: 4 },
    { fieldName: "Poland", ownerPlayerId: 1, troops: 3 },
    { fieldName: "Norway", ownerPlayerId: 1, troops: 2 },
    { fieldName: "Sweden", ownerPlayerId: 1, troops: 3 },
    { fieldName: "Finland", ownerPlayerId: 1, troops: 2 },
    { fieldName: "Ukraine", ownerPlayerId: 1, troops: 4 },
    { fieldName: "Romania", ownerPlayerId: 1, troops: 3 },
    { fieldName: "Greece", ownerPlayerId: 1, troops: 2 },
    { fieldName: "Turkey", ownerPlayerId: 1, troops: 2 },
    { fieldName: "Portugal", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Ireland", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Great Britain", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Belgium", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Netherlands", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Denmark", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Switzerland", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Austria", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Czech Republic", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Slovakia", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Hungary", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Bulgaria", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Balkan", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Moldova", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Belarus", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Estonia", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Latvia", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Lithuania", ownerPlayerId: 1, troops: 1 },
    { fieldName: "Iceland", ownerPlayerId: 1, troops: 1 },
  ],
};

// Simulated troop history over 12 turns
const mockTroopHistory: TroopSnapshot[] = [
  { turn: 1, troops: { 1: 5, 2: 5, 3: 5, 4: 5 } },
  { turn: 2, troops: { 1: 8, 2: 7, 3: 6, 4: 7 } },
  { turn: 3, troops: { 1: 12, 2: 9, 3: 8, 4: 6 } },
  { turn: 4, troops: { 1: 14, 2: 11, 3: 5, 4: 8 } },
  { turn: 5, troops: { 1: 18, 2: 10, 3: 7, 4: 5 } },
  { turn: 6, troops: { 1: 22, 2: 8, 3: 9, 4: 3 } },
  { turn: 7, troops: { 1: 25, 2: 12, 3: 6, 4: 0 } },
  { turn: 8, troops: { 1: 28, 2: 10, 3: 4, 4: 0 } },
  { turn: 9, troops: { 1: 32, 2: 7, 3: 3, 4: 0 } },
  { turn: 10, troops: { 1: 36, 2: 4, 3: 0, 4: 0 } },
  { turn: 11, troops: { 1: 40, 2: 2, 3: 0, 4: 0 } },
  { turn: 12, troops: { 1: 44, 2: 0, 3: 0, 4: 0 } },
];

export default function VictoryPreviewPage() {
  return (
    <div className="w-full h-screen bg-[#0a0908]">
      <VictoryScreen
        gameState={mockGameState}
        currentUserId={99}
        troopHistory={mockTroopHistory}
      />
    </div>
  );
}
