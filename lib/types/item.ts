import { ItemId } from "../gamedata/items";
import { AbilitySource } from "./Ability";
import { CreatureInstance } from "./entities/creature";
import StatAndAbilityProvider from "./StatAndAbilityProvider";
import { OptionalFunc } from "./types";

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

export interface ActivatableItemDefinition<TSource extends AbilitySource>
  extends StatAndAbilityProvider<TSource> {
  /**
   * Undefined defaults to true
   */
  canEquip?: (player: CreatureInstance) => boolean;
}

export type EquipmentDefinition = ActivatableItemDefinition<ItemInstance> &
  Omit<ItemDefinition, "tags" | "definitionId"> & {
    tags: [ItemTag.Equipment, ...ItemTag[]]; // Ensure Equipment always has the Equipment tag
    slot?: EquipmentSlot;
  };

export enum EquipmentSlot {
  Chest = "Chest",
  Hands = "Hands",
}

export const equipmentSlotToMaxEquipped: Record<EquipmentSlot, number> = {
  Chest: 1,
  Hands: 2,
};

export type ConsumableDefinition = ActivatableItemDefinition<ItemInstance> &
  Omit<ItemDefinition, "tags" | "definitionId"> & {
    tags: [ItemTag.Consumable, ...ItemTag[]]; // Ensure Consumable always has the Consumable tag
  };
