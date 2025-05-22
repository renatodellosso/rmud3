import items from "lib/gamedata/items";
import { EquipmentDefinition, ItemInstance, ItemTag } from "./item";
import { CreatureInstance } from "./creature";
import { PlayerInstance } from "./player";

export abstract class Hotbar {
  items: ItemInstance[] = [];

  abstract getCapacity(player: PlayerInstance): number;
  
  canEquip(item: ItemInstance, player: PlayerInstance): boolean {
    return (
      this.items.length < this.getCapacity(player) && !this.items.includes(item)
    );
  }

  equip(item: ItemInstance, player: PlayerInstance): boolean {
    if (this.canEquip(item, player)) {
      this.items.push(item);
      return true;
    }
    return false;
  }

  unequip(item: ItemInstance): boolean {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }
}

export class EquipmentHotbar extends Hotbar {
  getCapacity(player: PlayerInstance): number {
    return 4; // Example capacity
  }

  canEquip(item: ItemInstance, player: PlayerInstance): boolean {
    if (!super.canEquip(item, player)) return false;

    const def = items[item.definitionId] as EquipmentDefinition;
    if (!def.tags.includes(ItemTag.Equipment)) return false;

    if (def.canEquip && !def.canEquip!(player)) return false;

    return true;
  }
}

export class ConsumableHotbar extends Hotbar {
  getCapacity(player: PlayerInstance): number {
    return 3; // Example capacity
  }

  canEquip(item: ItemInstance, player: PlayerInstance): boolean {
    if (!super.canEquip(item, player)) return false;

    const def = items[item.definitionId] as EquipmentDefinition;
    if (!def.tags.includes(ItemTag.Consumable)) return false;

    if (def.canEquip && !def.canEquip!(player)) return false;

    return true;
  }
}
