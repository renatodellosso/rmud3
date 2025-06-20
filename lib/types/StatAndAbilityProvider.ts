import Ability, { AbilitySource } from "./Ability";
import { CreatureInstance } from "./entities/creature";
import { AbilityScore, DamageType, OptionalFunc } from "./types";

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
}
