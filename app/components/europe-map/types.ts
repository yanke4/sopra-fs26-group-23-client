export interface TerritoryState {
  owner: number;
  troops: number;
}

export interface EuropeMapProps {
  territories: Record<string, TerritoryState>;
  playerColors: string[];
  selectedTerritory: string | null;
  targetTerritory: string | null;
  onTerritoryClick: (name: string) => void;
  validTargets?: string[];
}
