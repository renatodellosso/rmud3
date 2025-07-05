import { DamageType } from "lib/types/Damage";
import {
  StatusEffectDefinition,
  StatusEffectStacking,
} from "lib/types/statuseffect";

export type StatusEffectId =
  | "stunned"
  | "infested"
  | "cursed"
  | "burning"
  | "poisoned"
  | "dreaming"
  | "satiated"
  | "stoneskin"
  | "overcharged"
  | "haste"
  | "blocking"
  | "suffocating"
  | "amphibious";

const statusEffects: Record<StatusEffectId, StatusEffectDefinition> = {
  stunned: {
    name: "Stunned",
    getDescription: (effect) =>
      `Your cooldowns are multipled by ${(effect.strength * 100).toFixed()}%.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getCooldown(creature, source, ability, cooldown) {
      return cooldown * source.strength;
    },
  },
  infested: {
    name: "Infested",
    getDescription: (effect) =>
      `Something burrows beneath your skin, dealing ${effect.strength.toFixed()} damage when infested expires.`,
    stacking: StatusEffectStacking.AddStrengthMaxDuration,
    onExpire(creature, source) {
      creature.takeDamage(
        [
          {
            amount: source.strength,
            type: DamageType.Piercing,
          },
        ],
        source,
        creature
      );
    },
  },
  cursed: {
    name: "Cursed",
    getDescription: (effect) =>
      `You are cursed, reducing your ability scores by ${effect.strength}.`,
    stacking: StatusEffectStacking.AddStrengthMaxDuration,
    getAbilityScores: {
      Strength: (creature, source) => -source.strength,
      Constitution: (creature, source) => -source.strength,
      Intelligence: (creature, source) => -source.strength,
    },
  },
  burning: {
    name: "Burning",
    getDescription: (effect) =>
      `You are on fire, taking ${effect.strength.toFixed()} damage each second.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    tick: (creature, deltaTime, source) =>
      creature.takeDamage(
        [
          {
            amount: source.strength * deltaTime,
            type: DamageType.Fire,
          },
        ],
        source,
        creature
      ),
  },
  poisoned: {
    name: "Poisoned",
    getDescription: (source) =>
      `You are poisoned, taking damage each second equal to ${
        (source.strength * 100).toFixed
      }% of your current health.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    tick: (creature, deltaTime, source) =>
      creature.takeDamage(
        [
          {
            amount: ((source.strength * deltaTime) / 100) * creature.health,
            type: DamageType.Poison,
          },
        ],
        source,
        creature
      ),
  },
  dreaming: {
    name: "Dreaming",
    getDescription: (source) =>
      `You are in a dream state, boosting your intelligence by ${source.strength.toFixed()}, but increasing cooldowns by ${(
        (source.strength / 50) *
        100
      ).toFixed()}%.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getAbilityScores: {
      Intelligence: (creature, source) => source.strength,
    },
    getCooldown(creature, source, ability, cooldown) {
      return (cooldown * source.strength) / 50;
    },
  },
  satiated: {
    name: "Satiated",
    getDescription: (source) =>
      `You are well-fed, improving your XP gain by ${(
        source.strength * 100
      ).toFixed()}%.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getXpToAdd(creature, source, amount) {
      return amount * (1 + source.strength / 100);
    },
  },
  stoneskin: {
    name: "Stoneskin",
    getDescription: (source) =>
      `Your skin is hardened, reducing damage taken by physical attacks by ${source.strength.toFixed()}%.`,
    stacking: StatusEffectStacking.AddStrengthMaxDuration,
    getDamageResistances: (creature, source) => [
      {
        type: DamageType.Bludgeoning,
        amount: source.strength,
      },
      {
        type: DamageType.Piercing,
        amount: source.strength,
      },
      {
        type: DamageType.Slashing,
        amount: source.strength,
      },
    ],
  },
  overcharged: {
    name: "Overcharged",
    getDescription: (source) =>
      `You are overcharged, boosting your ability scores by ${source.strength.toFixed()}.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getAbilityScores: {
      Strength: (creature, source) => source.strength,
      Constitution: (creature, source) => source.strength,
      Intelligence: (creature, source) => source.strength,
    },
  },
  haste: {
    name: "Haste",
    getDescription: (source) =>
      `You act with increased speed, reducing cooldowns by ${source.strength.toFixed()}%.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getCooldown: (creature, source, ability, cooldown) => {
      return cooldown * (1 - source.strength / 100);
    },
  },
  blocking: {
    name: "Blocking",
    getDescription: (source) =>
      `You are blocking, reducing all incoming damage by ${source.strength.toFixed()}%.`,
    stacking: StatusEffectStacking.AddStrengthAndDuration,
    getDamageResistances: (creature, source) => [
      {
        type: "*",
        amount: source.strength,
      },
    ],
  },
  suffocating: {
    name: "Suffocating",
    getDescription: (source) =>
      `You are suffocating, taking ${(
        source.strength * 100
      ).toFixed()}% of your max health as damage each second.`,
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    tick: (creature, deltaTime, source) =>
      creature.takeDamage(
        [
          {
            amount: (source.strength / 100) * creature.getMaxHealth(),
            type: DamageType.Suffocation,
          },
        ],
        source,
        creature
      ),
  },
  amphibious: {
    name: "Amphibious",
    getDescription: (source) =>
      `You can breathe underwater, ignoring suffocation effects.`,
    stacking: StatusEffectStacking.AddStrengthMaxDuration,
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "suffocating" ? undefined : effect,
    onApply: (creature, source) => {
      // If the creature is already suffocating, remove that effect
      creature.statusEffects = creature.statusEffects.filter(
        (se) => se.definitionId !== "suffocating"
      );
    },
  },
};

export default statusEffects;
