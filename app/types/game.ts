// Types for turn actions

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