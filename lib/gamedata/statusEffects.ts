import {
  StatusEffectDefinition,
  StatusEffectStacking,
} from "lib/types/statuseffect";
import { AbilityScore, DamageType } from "lib/types/types";

export type StatusEffectId =
  | "stunned"
  | "infested"
  | "cursed"
  | "burning"
  | "poisoned"
  | "dreaming";

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
        source
      );
    },
  },
  cursed: {
    name: "Cursed",
    description: "You are cursed, reducing your ability scores.",
    stacking: StatusEffectStacking.AddStrengthMaxDuration,
    getAbilityScores: {
      [AbilityScore.Strength]: (creature, source) => -source.strength,
      [AbilityScore.Constitution]: (creature, source) => -source.strength,
      [AbilityScore.Intelligence]: (creature, source) => -source.strength,
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
        source
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
        source
      ),
  },
  dreaming: {
    name: "Dreaming",
    description: "You are in a dream state, recovering health over time.",
    stacking: StatusEffectStacking.AddDurationMaxStrength,
    getAbilityScores: {
      [AbilityScore.Intelligence]: (creature, source) => source.strength,
    },
    getCooldown(creature, source, ability, cooldown) {
      return (cooldown * source.strength) / 10;
    },
  },
};

export default statusEffects;
