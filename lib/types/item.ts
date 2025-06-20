import items, { ItemId } from "../gamedata/items";
import Ability, { AbilitySource } from "./Ability";
import { CreatureInstance } from "./entities/creature";
import { AbilityScore, OptionalFunc } from "./types";

export type ItemDefinition = {
  name: string;
  tags: ItemTag[];
  description: string;
  getWeight: OptionalFunc<number, [ItemInstance]>;
  getSellValue: OptionalFunc<number, [ItemInstance]>;
};

export type ItemInstance = {
  definitionId: ItemId;
  amount: number;
};

export enum ItemTag {
  Equipment = "Equipment",
  Consumable = "Consumable",
}

export interface ActivatableItemDefinition {
  getAbilities?: OptionalFunc<Ability[], [CreatureInstance, ItemInstance]>;
  /**
   * Undefined defaults to true
   */
  canEquip?: (player: CreatureInstance) => boolean;
}

export type EquipmentDefinition = ActivatableItemDefinition &
  Omit<ItemDefinition, "tags" | "definitionId"> & {
    tags: [ItemTag.Equipment, ...ItemTag[]]; // Ensure Equipment always has the Equipment tag
    slot?: EquipmentSlot;
    getMaxHealth?: OptionalFunc<number, [CreatureInstance, ItemInstance]>;
    abilityScores?: {
      [score in AbilityScore]:
        | OptionalFunc<number, [CreatureInstance, ItemInstance]>
        | undefined;
    };
  };

export enum EquipmentSlot {
  Chest = "Chest",
}

export type ConsumableDefinition = ActivatableItemDefinition &
  Omit<ItemDefinition, "tags" | "definitionId"> & {
    tags: [ItemTag.Consumable, ...ItemTag[]]; // Ensure Consumable always has the Consumable tag
    getMaxUses?: OptionalFunc<number, [CreatureInstance, ItemInstance]>;
  };
