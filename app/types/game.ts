export type GameStatus = "RUNNING" | "FINISHED";
export type PlayerColor = "RED" | "BLUE" | "GREEN" | "YELLOW";
export interface AttackPayload {
  playerId: number;
  attacks: {
    attackingField: string;
    troops: number;
    defendingField: string;
  }[];
}

export interface TerritoryState {
  owner: number;
  troops: number;
}

export interface PlayerStateDTO {
  playerId: number;
  userId: number;
  username: string;
  color: PlayerColor;
  alive: boolean;
  troopCount: number;
}

export interface FieldStateDTO {
  fieldName: string;
  ownerPlayerId: number | null;
  troops: number;
}

export interface GameStateDTO {
  gameId: number;
  status: GameStatus;
  currentPlayerIndex: number;
  currentPlayerId: number;
  players: PlayerStateDTO[];
  fields: FieldStateDTO[];
}