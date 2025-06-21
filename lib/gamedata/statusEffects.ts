import { StatusEffectDefinition } from "lib/types/statuseffect";

export type StatusEffectId = "stunned";

const statusEffects: Record<StatusEffectId, StatusEffectDefinition> = {
  stunned: {
    name: "Stunned",
    description: "You are unable to act.",
  },
};

export default statusEffects;
