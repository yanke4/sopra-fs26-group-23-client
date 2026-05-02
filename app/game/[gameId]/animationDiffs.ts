import type {
  AttackAnimationData,
  DeployAnimationData,
  FortifyAnimationData,
} from "@/components/europe-map";
import type { FieldStateDTO, GameStateDTO } from "@/types/game";

export type AttackDiffResult = Omit<AttackAnimationData, "id">;
export type FortifyDiffResult = Omit<FortifyAnimationData, "id">;
export type DeployDiffResult = Omit<DeployAnimationData, "id">;

export const detectDeployFromDiff = (
  prev: GameStateDTO,
  next: GameStateDTO,
): DeployDiffResult | null => {
  const prevByName = new Map(prev.fields.map((f) => [f.fieldName, f]));
  const changed: { prev: FieldStateDTO; cur: FieldStateDTO }[] = [];
  for (const cur of next.fields) {
    const pf = prevByName.get(cur.fieldName);
    if (!pf) continue;
    if (pf.ownerPlayerId !== cur.ownerPlayerId || pf.troops !== cur.troops) {
      changed.push({ prev: pf, cur });
    }
  }
  if (changed.length !== 1) return null;
  const c = changed[0];
  if (c.prev.ownerPlayerId !== c.cur.ownerPlayerId) return null;
  const delta = c.cur.troops - c.prev.troops;
  if (delta <= 0) return null;
  return { field: c.prev.fieldName, troops: delta };
};

export const detectFortifyFromDiff = (
  prev: GameStateDTO,
  next: GameStateDTO,
): FortifyDiffResult | null => {
  const prevByName = new Map(prev.fields.map((f) => [f.fieldName, f]));
  const changed: { prev: FieldStateDTO; cur: FieldStateDTO }[] = [];
  for (const cur of next.fields) {
    const pf = prevByName.get(cur.fieldName);
    if (!pf) continue;
    if (pf.ownerPlayerId !== cur.ownerPlayerId || pf.troops !== cur.troops) {
      changed.push({ prev: pf, cur });
    }
  }
  if (changed.length !== 2) return null;
  const [a, b] = changed;
  if (
    a.prev.ownerPlayerId !== a.cur.ownerPlayerId ||
    b.prev.ownerPlayerId !== b.cur.ownerPlayerId
  )
    return null;
  if (a.prev.ownerPlayerId !== b.prev.ownerPlayerId) return null;

  const aDelta = a.cur.troops - a.prev.troops;
  const bDelta = b.cur.troops - b.prev.troops;
  if (aDelta + bDelta !== 0) return null;
  if (aDelta === 0) return null;

  const source = aDelta < 0 ? a : b;
  const dest = aDelta < 0 ? b : a;
  return {
    from: source.prev.fieldName,
    to: dest.prev.fieldName,
    troops: Math.abs(aDelta),
  };
};

export const detectAttackFromDiff = (
  prev: GameStateDTO,
  next: GameStateDTO,
): AttackDiffResult | null => {
  const prevByName = new Map(prev.fields.map((f) => [f.fieldName, f]));
  const changed: { prev: FieldStateDTO; cur: FieldStateDTO }[] = [];
  for (const cur of next.fields) {
    const pf = prevByName.get(cur.fieldName);
    if (!pf) continue;
    if (pf.ownerPlayerId !== cur.ownerPlayerId || pf.troops !== cur.troops) {
      changed.push({ prev: pf, cur });
    }
  }
  if (changed.length === 0) return null;

  const ownerChanges = changed.filter(
    (c) => c.prev.ownerPlayerId !== c.cur.ownerPlayerId,
  );

  if (ownerChanges.length === 1) {
    const defender = ownerChanges[0];
    const newOwner = defender.cur.ownerPlayerId;
    if (newOwner === null) return null;
    const attacker = changed.find(
      (c) =>
        c !== defender &&
        c.prev.ownerPlayerId === newOwner &&
        c.cur.ownerPlayerId === newOwner &&
        c.cur.troops < c.prev.troops,
    );
    if (!attacker) return null;
    const troopsMoved = attacker.prev.troops - attacker.cur.troops;
    const survivingAttackers = defender.cur.troops;
    return {
      attacker: attacker.prev.fieldName,
      defender: defender.prev.fieldName,
      attackerLosses: Math.max(0, troopsMoved - survivingAttackers),
      defenderLosses: defender.prev.troops,
      conquered: true,
    };
  }

  if (changed.length === 2 && ownerChanges.length === 0) {
    const [a, b] = changed;
    if (a.cur.troops >= a.prev.troops || b.cur.troops >= b.prev.troops)
      return null;
    if (a.prev.ownerPlayerId === b.prev.ownerPlayerId) return null;
    const attackerField =
      a.prev.ownerPlayerId === prev.currentPlayerId
        ? a
        : b.prev.ownerPlayerId === prev.currentPlayerId
          ? b
          : null;
    if (!attackerField) return null;
    const defenderField = attackerField === a ? b : a;
    return {
      attacker: attackerField.prev.fieldName,
      defender: defenderField.prev.fieldName,
      attackerLosses: attackerField.prev.troops - attackerField.cur.troops,
      defenderLosses: defenderField.prev.troops - defenderField.cur.troops,
      conquered: false,
    };
  }

  return null;
};
