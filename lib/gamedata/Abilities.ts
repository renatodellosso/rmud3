import Ability from "lib/types/Ability";
import { CreatureInstance } from "lib/types/entities/creature";
import { OptionalFunc, DamageType, Targetable } from "lib/types/types";
import * as CanTarget from "lib/gamedata/CanTarget";
import { getIo } from "lib/ClientFriendlyIo";
import { StatusEffectId } from "./statusEffects";

// IMPORTANT: If you're adding a new target check, add it as a function in CanTarget to avoid circular dependencies.
// Not sure why that happens, but it does.

export function attack(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  damage: number,
  damageType: DamageType,
  targetRestrictions?: ((
    creature: CreatureInstance,
    target: Targetable
  ) => boolean)[]
): Ability {
  return {
    name,
    getDescription,
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.notSelf,
      CanTarget.isTargetACreature,
      ...(targetRestrictions ?? [])
    ),
    activate: (creature: CreatureInstance, targets: Targetable[]) => {
      if (targets.length !== 1) {
        throw new Error(
          `Expected exactly one target for ability ${name}, but got ${targets.length}.`
        );
      }

      const target = targets[0] as CreatureInstance;

      let newDamage = creature.getDamageToDeal(damage, damageType);

      const damageDealt: { amount: number; type: DamageType }[] =
        target.takeDamage(newDamage, creature);

      const io = getIo();
      for (const d of damageDealt) {
        getIo().sendMsgToRoom(
          creature.location,
          `${creature.name} hit ${target.name} for ${d.amount} ${d.type} using ${name}!`
        );
      }

      return true;
    },
  };
}

/**
 * @param statusEffectDuration in seconds
 */
export function applyStatusEffect(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  statusEffect: StatusEffectId,
  statusEffectDuration: number,
  targetRestrictions?: ((
    creature: CreatureInstance,
    target: Targetable
  ) => boolean)[]
): Ability {
  return {
    name,
    getDescription,
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.isTargetACreature,
      ...(targetRestrictions ?? [])
    ),
    activate: (creature: CreatureInstance, targets: Targetable[]) => {
      if (targets.length !== 1) {
        throw new Error(
          `Expected exactly one target for ability ${name}, but got ${targets.length}.`
        );
      }

      const target = targets[0] as CreatureInstance;

      target.addStatusEffect(statusEffect, statusEffectDuration);

      getIo().sendMsgToRoom(
        creature.location,
        `${creature.name} applied ${statusEffect} to ${target.name} using ${name}!`
      );

      return true;
    }
  }
}

export function attackWithStatusEffect(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  damage: number,
  damageType: DamageType,
  statusEffect: StatusEffectId,
  statusEffectDuration: number,
  targetRestrictions?: ((
    creature: CreatureInstance,
    target: Targetable
  ) => boolean)[]
): Ability {
  return {
    name,
    getDescription,
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.notSelf,
      CanTarget.isTargetACreature,
      ...(targetRestrictions ?? [])
    ),
    activate: (creature: CreatureInstance, targets: Targetable[]) => {
      if (targets.length !== 1) {
        throw new Error(
          `Expected exactly one target for ability ${name}, but got ${targets.length}.`
        );
      }

      const target = targets[0] as CreatureInstance;

      let newDamage = creature.getDamageToDeal(damage, damageType);

      const damageDealt: { amount: number; type: DamageType }[] =
        target.takeDamage(newDamage, creature);

      const io = getIo();
      for (const d of damageDealt) {
        getIo().sendMsgToRoom(
          creature.location,
          `${creature.name} hit ${target.name} for ${d.amount} ${d.type} using ${name}!`
        );
      }

      target.addStatusEffect(statusEffect, statusEffectDuration);

      io.sendMsgToRoom(
        creature.location,
        `${creature.name} applied ${statusEffect} to ${target.name} using ${name}!`
      );

      return true;
    },
  };
}

export function heal(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  health: number,
  targetRestrictions?: ((
    creature: CreatureInstance,
    target: Targetable
  ) => boolean)[]
): Ability {
  return {
    name,
    getDescription,
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.isTargetACreature,
      CanTarget.notAtMaxHealth,
      ...(targetRestrictions ?? [])
    ),
    activate: (creature: CreatureInstance, targets: Targetable[]) => {
      if (targets.length !== 1) {
        throw new Error(
          `Expected exactly one target for ability ${name}, but got ${targets.length}.`
        );
      }

      const target = targets[0] as CreatureInstance;

      if (target.health >= target.getMaxHealth()) return false;

      const healthAdded = target.addHealth(health);

      getIo().sendMsgToRoom(
        creature.location,
        `${creature.name} healed ${
          target === creature ? "themself" : target.name
        } for ${healthAdded} using ${name}!`
      );

      return true;
    },
  };
}
