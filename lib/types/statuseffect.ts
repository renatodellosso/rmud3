import { StatusEffectId } from "lib/gamedata/statusEffects";
import StatAndAbilityProvider from "./StatAndAbilityProvider";
import { CreatureInstance } from "./entities/creature";
import { OptionalFunc } from "./types";

export type StatusEffectDefinition =
  StatAndAbilityProvider<StatusEffectInstance> & {
    name: string;
    getDescription: OptionalFunc<string, [StatusEffectInstance]>;
    stacking: StatusEffectStacking;
    onExpire?: (
      creature: CreatureInstance,
      source: StatusEffectInstance
    ) => void;
    onApply?: (
      creature: CreatureInstance,
      source: StatusEffectInstance
    ) => void;
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
