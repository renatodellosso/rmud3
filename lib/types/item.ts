import items from "../gamedata/items";
import Ability from "./Ability";
import { CreatureInstance } from "./creature";
import { AbilityScore, OptionalFunc } from "./utilstypes";

export type ItemDefinition = {
  name: string;
  tags: ItemTag[];
  description: string;
  weight: number;
};

export type ItemInstance = {
  definitionId: keyof typeof items;
  amount: number;
};

export enum ItemTag {}

export type EquipmentDefinition = ItemDefinition & {
  slot?: EquipmentSlot;
  getAbilities?: OptionalFunc<Ability[], [CreatureInstance, ItemInstance]>;
  getMaxHealth?: OptionalFunc<number, [CreatureInstance, ItemInstance]>;
  abilityScores?: {
    [score in AbilityScore]:
      | OptionalFunc<number, [CreatureInstance, ItemInstance]>
      | undefined;
  };
};

export enum EquipmentSlot {}
