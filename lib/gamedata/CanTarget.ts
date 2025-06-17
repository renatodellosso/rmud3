import { CreatureInstance } from "lib/types/creature";
import { Targetable } from "lib/types/types";

export function and(
  ...args: ((creature: CreatureInstance, target: Targetable) => boolean)[]
): (creature: CreatureInstance, target: Targetable) => boolean {
  return (creature: CreatureInstance, target: Targetable) =>
    args.every((arg) => arg(creature, target));
}

export function notSelf(
  creature: CreatureInstance,
  target: Targetable
): boolean {
  if (!isTargetACreature(creature, target)) {
    return true;
  }

  const cSelf = creature as CreatureInstance;
  const cTarget = target as CreatureInstance;

  return !cSelf._id.equals(cTarget._id);
}

export function isTargetACreature(
  creature: CreatureInstance,
  target: Targetable
): target is CreatureInstance {
  return "definitionId" in target && "health" in target;
}

export function isPlayer(
  creature: CreatureInstance,
  target: Targetable
): boolean {
  return (
    isTargetACreature(creature, target) &&
    (target as CreatureInstance).definitionId === "player"
  );
}
