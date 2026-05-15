export type GameStatus = "RUNNING" | "FINISHED";
export type GamePhase = "DEPLOY" | "ATTACK" | "FORTIFY";
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
  visible?: boolean;
}

export type MissionType =
  | "CONTROL_TWO_REGIONS"
  | "ELIMINATE_PLAYER"
  | "KILL_EIGHT_TROOPS_IN_TURN"
  | "FIFTEEN_TROOPS_ON_TERRITORY"
  | "HOLD_REGION_WITH_THREE_TROOPS"
  | "CONQUER_ICELAND"
  | "CONQUER_TURKEY"
  | "CONQUER_PORTUGAL"
  | "NO_ATTACK_THIS_TURN"
  | "CONQUER_FIVE_TERRITORIES_IN_TURN";

export type MissionStatus = "LOCKED" | "ACTIVE" | "COMPLETED";

export interface PlayerStateDTO {
  playerId: number;
  userId: number;
  username: string;
  color: PlayerColor;
  alive: boolean;
  troopCount: number;
  missionType?: MissionType | null;
  missionDescription?: string | null;
  missionStatus?: MissionStatus | null;
  missionStartRound?: number;
  missionExpiresAtRound?: number;
  missionBonusTroops?: number;
}

export interface FieldStateDTO {
  fieldName: string;
  ownerPlayerId: number | null;
  troops: number;
}

export interface AttackEventDTO {
  attacker: string;
  defender: string;
  attackerLosses: number;
  defenderLosses: number;
  conquered: boolean;
}

export interface GameStateDTO {
  gameId: number;
  status: GameStatus;
  currentPlayerIndex: number;
  currentPlayerId: number;
  currentPhase: GamePhase;
  turnNumber: number;
  players: PlayerStateDTO[];
  fields: FieldStateDTO[];
  lastAttack?: AttackEventDTO | null;
  turnTimerSeconds?: number | null;
  turnStartedAtMillis?: number | null;
  timedOutPlayerId?: number | null;
  fogOfWarEnabled: boolean;
}
