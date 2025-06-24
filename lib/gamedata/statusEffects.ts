import {
  StatusEffectDefinition,
  StatusEffectStacking,
} from "lib/types/statuseffect";
import { DamageType } from "lib/types/types";

export type StatusEffectId = "stunned" | "infested";

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
};

export default statusEffects;
