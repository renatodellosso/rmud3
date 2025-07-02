import { CreatureInstance } from "lib/types/entities/creature";
import { Location } from "lib/types/Location";
import { Targetable } from "lib/types/types";

export function not(
  arg: (creature: CreatureInstance, target: Targetable) => boolean
): (creature: CreatureInstance, target: Targetable) => boolean {
  return (creature: CreatureInstance, target: Targetable) =>
    !arg(creature, target);
}

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
  return not(isSelf)(creature, target);
}

export function isTargetACreature(
  creature: CreatureInstance,
  target: Targetable
): target is CreatureInstance {
  return "definitionId" in target && "health" in target;
}

export function isTargetALocation(
  creature: CreatureInstance,
  target: Targetable
): target is Location {
  return "entities" in target && "exits" in target;
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

/**
 * @returns true if the target is a player or a friendly creature.
 */
export function isAlly(
  creature: CreatureInstance,
  target: Targetable
): boolean {
  return (
    isTargetACreature(creature, target) &&
    (target.definitionId === "player" ||
      target.definitionId.startsWith("friendly"))
  );
}

export function isSelf(
  creature: CreatureInstance,
  target: Targetable
): boolean {
  return isTargetACreature(creature, target) && creature === target;
}

export function notAtMaxHealth(
  creature: CreatureInstance,
  target: Targetable
): boolean {
  if (!isTargetACreature(creature, target)) {
    return false;
  }

  const cTarget = target as CreatureInstance;

  return cTarget.health < cTarget.getMaxHealth();
}
