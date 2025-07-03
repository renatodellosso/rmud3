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
  | "overcharged";

const statusEffects: Record<StatusEffectId, StatusEffectDefinition> = {
  stunned: {
    name: "Stunned",
    description: "You are unable to act.",
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getCooldown(creature, source, ability, cooldown) {
      return cooldown * source.strength;
    },
  },
  infested: {
    name: "Infested",
    description:
      "Something burrows beneath your skin, dealing damage when infested expires.",
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
    description: "You are cursed, reducing your ability scores.",
    stacking: StatusEffectStacking.AddStrengthMaxDuration,
    getAbilityScores: {
      Strength: (creature, source) => -source.strength,
      Constitution: (creature, source) => -source.strength,
      Intelligence: (creature, source) => -source.strength,
    },
  },
  burning: {
    name: "Burning",
    description: "You are on fire, taking a flat amount of damage each turn.",
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
    description:
      "You are poisoned, taking damage each turn based on your current health.",
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
    description:
      "You are in a dream state, boosting your intelligence, but increasing cooldowns.",
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
    description: "You are well-fed, improving your XP gain.",
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getXpToAdd(creature, source, amount) {
      return amount * (1 + source.strength / 100);
    },
  },
  stoneskin: {
    name: "Stoneskin",
    description:
      "Your skin is hardened, reducing damage taken by physical attacks.",
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
    description: "You are overcharged, boosting your ability scores.",
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getAbilityScores: {
      Strength: (creature, source) => source.strength,
      Constitution: (creature, source) => source.strength,
      Intelligence: (creature, source) => source.strength,
    },
  },
};

export default statusEffects;
