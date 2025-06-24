import Ability, { AbilitySource } from "./Ability";
import { CreatureInstance } from "./entities/creature";
import { AbilityScore, DamageType, DamageWithType, OptionalFunc } from "./types";

export default interface StatAndAbilityProvider<
  TSource extends AbilitySource = AbilitySource
> {
  getAbilities?: OptionalFunc<Ability[], [CreatureInstance, TSource]>;
  getMaxHealth?: OptionalFunc<number, [CreatureInstance, TSource]>;
  getAbilityScores?: {
    [score in AbilityScore]:
      | OptionalFunc<number, [CreatureInstance, TSource]>
      | undefined;
  };
  getCarryingCapacity?: OptionalFunc<number, [CreatureInstance, TSource]>;
  getDamageResistances?: OptionalFunc<
    { amount: number; type: DamageType | "*" }[],
    [CreatureInstance, TSource]
  >;
  getDamageBonuses?: OptionalFunc<
    { amount: number; type: DamageType | "*" }[],
    [CreatureInstance, TSource]
  >;
  getDamageToDeal?: (
    creature: CreatureInstance,
    source: TSource,
    damage: { amount: number; type: DamageType }[]
  ) => { amount: number; type: DamageType }[];
  getDamageToTake?: (
    creature: CreatureInstance,
    source: TSource,
    damage: { amount: number; type: DamageType }[]
  ) => { amount: number; type: DamageType }[];
  /**
   * @param cooldown in seconds
   */
  getCooldown?: (
    creature: CreatureInstance,
    source: TSource,
    ability: Ability,
    cooldown: number
  ) => number;
  tick?: (
    creature: CreatureInstance,
    deltaTime: number,
    source: TSource
  ) => void;
}
