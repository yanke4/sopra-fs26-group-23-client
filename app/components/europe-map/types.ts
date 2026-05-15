import type { AttackAnimationData } from "./AttackAnimation";
import type { FortifyAnimationData } from "./FortifyAnimation";
import type { DeployAnimationData } from "./DeployAnimation";

export interface TerritoryState {
  owner: number;
  troops: number;
  visible?: boolean;
}

export interface EuropeMapProps {
  territories: Record<string, TerritoryState>;
  playerColors: string[];
  selectedTerritory: string | null;
  inspectedTerritory: string | null;
  targetTerritory: string | null;
  onTerritoryClick: (name: string) => void;
  validTargets?: string[];
  attackAnimation?: AttackAnimationData | null;
  fortifyAnimation?: FortifyAnimationData | null;
  deployAnimation?: DeployAnimationData | null;
}
