import {
  StatusEffectDefinition,
  StatusEffectStacking,
} from "lib/types/statuseffect";

export type StatusEffectId = "stunned" | "infested";

const statusEffects: Record<StatusEffectId, StatusEffectDefinition> = {
  stunned: {
    name: "Stunned",
    description: "You are unable to act.",
    stacking: StatusEffectStacking.AddDurationMaxStrength,
  },
  infested: {
    name: "Infested",
    description:
      "Something burrows beneath your skin, dealing damage when infested expires.",
    stacking: StatusEffectStacking.AddStrengthMaxDuration,
  },
};

export default statusEffects;
