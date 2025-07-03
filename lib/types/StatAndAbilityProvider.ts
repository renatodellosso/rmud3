import Ability, { AbilitySource } from "./Ability";
import { DamageType } from "./Damage";
import { CreatureInstance } from "./entities/creature";
import { PlayerInstance } from "./entities/player";
import { StatusEffectToApply } from "./statuseffect";
import { DamageWithType, OptionalFunc } from "./types";
import AbilityScore from "lib/types/AbilityScore";

export default interface StatAndAbilityProvider<
  TSource extends AbilitySource = AbilitySource
> {
  getAbilities?: OptionalFunc<Ability[], [CreatureInstance, TSource]>;
  getMaxHealth?: OptionalFunc<number, [CreatureInstance, TSource]>;
  getAbilityScores?: {
    [score in AbilityScore]?:
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
  onAttack?: (
    creature: CreatureInstance,
    source: TSource,
    damage: DamageWithType[]
  ) => void;
  onTakeDamage?: (
    creature: CreatureInstance,
    source: TSource,
    damage: DamageWithType[]
  ) => void;
  /**
   * @param cooldown in seconds
   */
  getCooldown?: (
    creature: CreatureInstance,
    source: TSource,
    ability: Ability,
    cooldown: number
  ) => number;
  getStatusEffectDuration?: (
    creature: CreatureInstance,
    effect: StatusEffectToApply
  ) => number;
  tick?: (
    creature: CreatureInstance,
    deltaTime: number,
    source: TSource
  ) => void;
  getXpToAdd?: (
    player: PlayerInstance,
    source: TSource,
    amount: number
  ) => number;
}
