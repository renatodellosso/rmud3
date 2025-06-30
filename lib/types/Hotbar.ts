import items from "lib/gamedata/items";
import { ItemTag } from "lib/types/itemenums";
import {
  EquipmentDefinition,
  equipmentSlotToMaxEquipped,
  ItemInstance,
} from "./item";
import { CreatureInstance } from "./entities/creature";
import { PlayerInstance } from "./entities/player";
import { areItemInstancesEqual } from "lib/utils";
import { getEquipmentLimitForLevel } from "lib/gamedata/levelling";

export abstract class Hotbar {
  items: ItemInstance[] = [];

  abstract getCapacity(player: PlayerInstance): number;

  canEquip(player: PlayerInstance, item: ItemInstance): boolean {
    return (
      this.items.length < this.getCapacity(player) && !this.isEquipped(item)
    );
  }

  equip(player: PlayerInstance, item: ItemInstance): boolean {
    if (this.canEquip(player, item)) {
      this.items.push(item);
      return true;
    }
    return false;
  }

  unequip(item: ItemInstance): boolean {
    const index = this.items.findIndex((i) => areItemInstancesEqual(i, item));
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  isEquipped(item: ItemInstance): boolean {
    return this.items.some((i) => areItemInstancesEqual(i, item));
  }
}

export class EquipmentHotbar extends Hotbar {
  getCapacity(player: PlayerInstance): number {
    return getEquipmentLimitForLevel(player.level);
  }

  canEquip(player: PlayerInstance, item: ItemInstance): boolean {
    if (!super.canEquip(player, item)) return false;

    const def = items[item.definitionId] as EquipmentDefinition;
    if (!def.tags.includes(ItemTag.Equipment)) return false;
    if (def.canEquip && !def.canEquip!(player)) return false;

    if (
      def.slot &&
      this.items.filter((i) => {
        const existingDef = items[i.definitionId] as EquipmentDefinition;
        return existingDef.slot === def.slot;
      }).length >= equipmentSlotToMaxEquipped[def.slot]
    )
      return false;

    return true;
  }
}
