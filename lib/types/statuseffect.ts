import { StatusEffectId } from "lib/gamedata/statusEffects";
import StatAndAbilityProvider from "./StatAndAbilityProvider";
import { CreatureInstance } from "./entities/creature";
import { OptionalFunc } from "./types";

export type StatusEffectDefinition =
  StatAndAbilityProvider<StatusEffectInstance> & {
    name: string;
    getDescription: OptionalFunc<string, [StatusEffectInstance]>;
    stacking: StatusEffectStacking;
    maxStrength?: number;
    onExpire?: (
      creature: CreatureInstance,
      source: StatusEffectInstance
    ) => void;
    onApply?: (
      creature: CreatureInstance,
      source: StatusEffectInstance
    ) => void;
  };

export class StatusEffectInstance {
  definitionId: StatusEffectId;
  strength: number;
  expiresAt: Date;
  canActAt: Date = new Date();
  lastActedAt: Date = new Date();

  constructor(
    definitionId: StatusEffectId,
    strength: number,
    expiresAt: Date
  ) {
    this.definitionId = definitionId;
    this.strength = strength;
    this.expiresAt = expiresAt;
  }
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
