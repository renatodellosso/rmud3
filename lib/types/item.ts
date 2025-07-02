import reforges, { ReforgeId } from "lib/gamedata/Reforges";
import items, { ItemId } from "../gamedata/items";
import { EquipmentSlot, ItemTag } from "./itemenums";
import { AbilitySource } from "./Ability";
import { CreatureInstance } from "./entities/creature";
import StatAndAbilityProvider from "./StatAndAbilityProvider";
import { DamageWithType, OptionalFunc } from "./types";
import { getFromOptionalFunc } from "lib/utils";
import { ObjectId } from "bson";

export type ItemDefinition = {
  getName: OptionalFunc<string, [ItemInstance]>;
  tags: ItemTag[];
  description: string;
  getWeight: OptionalFunc<number, [ItemInstance]>;
  getSellValue: OptionalFunc<number, [ItemInstance]>;
};

export class ItemInstance {
  definitionId: ItemId;
  amount: number;
  reforge?: ReforgeId;
  guildId?: ObjectId;
  guildName?: string;

  constructor(
    definitionId: ItemId,
    amount: number,
    reforge?: ReforgeId,
    guildId?: ObjectId,
    guildName?: string
  ) {
    this.definitionId = definitionId;
    this.amount = amount;
    this.reforge = reforge ?? undefined;
    this.guildId = guildId ?? undefined;
    this.guildName = guildName ?? undefined;
  }

  getName(): string {
    if (!this.reforge) {
      return getFromOptionalFunc(items[this.definitionId].getName, this);
    }
    return `${reforges[this.reforge].name} ${getFromOptionalFunc(
      items[this.definitionId].getName,
      this
    )}`;
  }
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

export const equipmentSlotToMaxEquipped: Record<EquipmentSlot, number> = {
  Legs: 1,
  Chest: 1,
  Head: 1,
  Hands: 2,
  Back: 1,
};

export type ConsumableDefinition = ActivatableItemDefinition<ItemInstance> &
  Omit<ItemDefinition, "tags" | "definitionId"> & {
    tags: [ItemTag.Consumable, ...ItemTag[]]; // Ensure Consumable always has the Consumable tag
  };
