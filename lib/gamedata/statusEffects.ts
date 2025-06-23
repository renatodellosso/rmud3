import { StatusEffectDefinition } from "lib/types/statuseffect";

export type StatusEffectId = 
  | "stunned"
  | "infested";

const statusEffects: Record<StatusEffectId, StatusEffectDefinition> = {
  stunned: {
    name: "Stunned",
    description: "You are unable to act.",
  },
  infested: {
    name: "Infested",
    description: "Something burrows beneath your skin, dealing damage when infested expires."
  }
};

export default statusEffects;
