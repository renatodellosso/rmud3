import Ability, { AbilitySource } from "lib/types/Ability";
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
import { getFromOptionalFunc } from "lib/utils";
import { ItemInstance } from "lib/types/item";
import reforges from "./Reforges";

// IMPORTANT: If you're adding a new target check, add it as a function in CanTarget to avoid circular dependencies.
// Not sure why that happens, but it does.

function addToDescription(
  getDescription: OptionalFunc<string, CreatureInstance>,
  addition: string
): OptionalFunc<string, CreatureInstance> {
  return (creature: CreatureInstance) => {
    const description = getFromOptionalFunc(getDescription, creature);
    return `${description} ${addition}`;
  };
}

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
    getDescription: addToDescription(
      getDescription,
      `Inflicts ${damage.map((d) => `${d.amount} ${d.type}`)}.`
    ),
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.notSelf,
      CanTarget.isTargetACreature,
      ...(targetRestrictions ?? [])
    ),
    activate: (
      creature: CreatureInstance,
      targets: Targetable[],
      source: AbilitySource
    ) => {
      if (targets.length !== 1) {
        throw new Error(
          `Expected exactly one target for ability ${name}, but got ${targets.length}.`
        );
      }

      let damagePercent: number = 1;

      if ((source as ItemInstance) && (source as ItemInstance).reforge) {
        let reforge = reforges[(source as ItemInstance).reforge!];

        damagePercent = reforge.damageBonusPercent
          ? reforge.damageBonusPercent
          : 1;
      }

      const target = targets[0] as CreatureInstance;

      let newDamage = damage.map((d) => ({
        amount: Math.ceil(d.amount * damagePercent),
        type: d.type,
      }));

      newDamage = creature.getDamageToDeal(newDamage);

      const damageDealt: { amount: number; type: DamageType }[] =
        target.takeDamage(newDamage, creature);

      getIo().sendMsgToRoom(
        creature.location,
        `${creature.name} hit ${target.name} using ${name} for ${damageDealt
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
    getDescription: addToDescription(
      getDescription,
      `Applies ${effects
        .map(
          (effect) =>
            `${statusEffects[effect.id].name} (${effect.strength}) for ${
              effect.duration
            }s`
        )
        .join(", ")}.`
    ),
    getCooldown: (creature, source) =>
      creature.scaleAbility(getFromOptionalFunc(getCooldown, creature, source)),
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.isTargetACreature,
      ...(targetRestrictions ?? [])
    ),
    activate: (creature: CreatureInstance, targets: Targetable[]) => {
      for (const rawTarget of targets) {
        const target = rawTarget as CreatureInstance;

        for (const statusEffect of effects) {
          const scaledEffect: StatusEffectToApply = {
            ...statusEffect,
            strength: creature.scaleAbility(statusEffect.strength),
            duration: creature.scaleAbility(statusEffect.duration),
          };

          target.addStatusEffect(scaledEffect);

          getIo().sendMsgToRoom(
            creature.location,
            `${creature.name} applied ${statusEffects[scaledEffect.id].name} ${
              scaledEffect.strength ? `(${scaledEffect.strength}) ` : ""
            }to ${target.name} for ${scaledEffect.duration}s using ${name}!`
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
  const { activate: attackFunc, getDescription: attackDescription } = attack(
    name,
    getDescription,
    getCooldown,
    damage,
    targetRestrictions
  );
  const {
    activate: applyStatusEffectFunc,
    getDescription: applyStatusEffectDescription,
  } = applyStatusEffect(
    name,
    attackDescription as OptionalFunc<string, CreatureInstance>,
    getCooldown,
    statusEffectsToApply,
    targetRestrictions
  );

  return {
    name,
    getDescription: applyStatusEffectDescription,
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.notSelf,
      CanTarget.isTargetACreature,
      ...(targetRestrictions ?? [])
    ),
    activate: (creature: CreatureInstance, targets: Targetable[], source) =>
      attackFunc(creature, targets, source) &&
      applyStatusEffectFunc(creature, targets, source),
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
