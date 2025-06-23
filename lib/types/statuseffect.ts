import { StatusEffectId } from "lib/gamedata/statusEffects";
import StatAndAbilityProvider from "./StatAndAbilityProvider";

export type StatusEffectDefinition =
  StatAndAbilityProvider<StatusEffectInstance> & {
    name: string;
    description: string;
    stacking: StatusEffectStacking;
  };

export type StatusEffectInstance = {
  definitionId: StatusEffectId;
  strength: number;
  expiresAt: Date;
};

export type StatusEffectToApply = {
  id: StatusEffectId;
  strength: number;
  /**
   * In seconds
   */
  duration: number;
};

export enum StatusEffectStacking {
  Separate,
  AddStrengthMaxDuration,
  AddDurationMaxStrength,
  AddStrengthAndDuration,
  MaxStrength,
  MaxDuration,
}
