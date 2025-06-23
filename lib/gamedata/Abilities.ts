import Ability from "lib/types/Ability";
import { CreatureInstance } from "lib/types/entities/creature";
import {
  OptionalFunc,
  DamageType,
  Targetable,
  DamageWithType,
} from "lib/types/types";
import * as CanTarget from "lib/gamedata/CanTarget";
import { getIo } from "lib/ClientFriendlyIo";
import statusEffects, { StatusEffectId } from "./statusEffects";
import { StatusEffectToApply } from "lib/types/statuseffect";

// IMPORTANT: If you're adding a new target check, add it as a function in CanTarget to avoid circular dependencies.
// Not sure why that happens, but it does.

export function attack(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  damage: DamageWithType[],
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

      const finalDamage: DamageWithType[] = [];
      for (const d of damage) {
        let newDamage = creature.getDamageToDeal(d.amount, d.type);

        const damageDealt: { amount: number; type: DamageType }[] =
          target.takeDamage(newDamage, creature);

        finalDamage.push(...damageDealt);
      }

      getIo().sendMsgToRoom(
        creature.location,
        `${creature.name} hit ${target.name} using ${name} for ${finalDamage
          .map((d) => `${d.amount} ${d.type}`)
          .join(", ")}!`
      );

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
  effects: StatusEffectToApply[],
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
      for (const rawTarget of targets) {
        const target = rawTarget as CreatureInstance;

        for (const statusEffect of effects) {
          target.addStatusEffect(statusEffect);

          getIo().sendMsgToRoom(
            creature.location,
            `${creature.name} applied ${statusEffects[statusEffect.id].name} ${
              statusEffect.strength ? `(${statusEffect.strength}) ` : ""
            }to ${target.name} for ${statusEffect.duration}s using ${name}!`
          );
        }
      }

      return true;
    },
  };
}

export function attackWithStatusEffect(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  damage: DamageWithType[],
  statusEffectsToApply: StatusEffectToApply[],
  targetRestrictions?: ((
    creature: CreatureInstance,
    target: Targetable
  ) => boolean)[]
): Ability {
  const attackFunc = attack(
    name,
    getDescription,
    getCooldown,
    damage,
    targetRestrictions
  ).activate;

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
    activate: (creature: CreatureInstance, targets: Targetable[], source) => {
      attackFunc(creature, targets, source);

      const io = getIo();

      for (const rawTarget of targets) {
        const target = rawTarget as CreatureInstance;

        for (const statusEffect of statusEffectsToApply) {
          target.addStatusEffect(statusEffect);
          io.sendMsgToRoom(
            creature.location,
            `${creature.name} applied ${statusEffects[statusEffect.id].name} ${
              statusEffect.strength ? `(${statusEffect.strength}) ` : ""
            }to ${target.name} for ${statusEffect.duration}s using ${name}!`
          );
        }
      }

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
