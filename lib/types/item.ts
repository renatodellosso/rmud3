import items from "../gamedata/items";
import Ability from "./Ability";
import { CreatureInstance } from "./creature";
import { AbilityScore, OptionalFunc } from "./types";

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

export enum ItemTag {
  Equipment = "Equipment",
}

export type EquipmentDefinition = Omit<
  ItemDefinition,
  "tags" | "definitionId"
> & {
  tags: [ItemTag.Equipment, ...ItemTag[]]; // Ensure Equipment always has the Equipment tag
  slot?: EquipmentSlot;
  getAbilities?: OptionalFunc<Ability[], [CreatureInstance, ItemInstance]>;
  getMaxHealth?: OptionalFunc<number, [CreatureInstance, ItemInstance]>;
  abilityScores?: {
    [score in AbilityScore]:
      | OptionalFunc<number, [CreatureInstance, ItemInstance]>
      | undefined;
  };
  /**
   * Undefined defaults to true
   */
  canEquip?: (player: CreatureInstance) => boolean;
};

export enum EquipmentSlot {
  Chest = "Chest",
}
