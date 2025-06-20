import Ability, { AbilitySource } from "./Ability";
import { CreatureInstance } from "./entities/creature";
import { AbilityScore, OptionalFunc } from "./types";

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
}
