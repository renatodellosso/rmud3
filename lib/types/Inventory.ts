import items, { ItemId } from "../gamedata/items";
import { ItemInstance } from "./item";
import { areItemInstancesEqual } from "../utils";

export default interface Inventory {
  /**
   * @returns how many items were added to the inventory before hitting the weight limit.
   */
  add(item: ItemInstance): number;
  /**
   * Removes an item from the inventory.
   * If the item is not in the inventory, it will be ignored.
   * If the item is in the inventory but not enough of it, it will be removed completely.
   * @returns how many items were removed from the inventory.
   */
  remove(item: ItemInstance): number;

  /**
   * @returns The maximum size of the inventory. If undefined, the inventory is unlimited.
   */
  getMaxWeight(): number | undefined;

  getUsedWeight(): number;
  getById(itemId: ItemId): ItemInstance | undefined;
}

/**
 * An inventory that directly contains items.
 */
export class DirectInventory implements Inventory {
  items: ItemInstance[] = [];

  constructor(items: ItemInstance[] = []) {
    this.items = items;
  }

  add(item: ItemInstance) {
    const existingItem = this.items.find((i) => areItemInstancesEqual(i, item));

    const maxWeight = this.getMaxWeight();
    const usedWeight = this.getUsedWeight();
    const amountToAdd =
      maxWeight === undefined
        ? item.amount
        : Math.min(
            Math.floor(
              (maxWeight - usedWeight) / items[item.definitionId].weight
            ),
            item.amount
          );

    if (existingItem) {
      existingItem.amount += amountToAdd;
      return amountToAdd;
    } else {
      this.items.push({ ...item, amount: amountToAdd });
      return amountToAdd;
    }
  }

  remove(item: ItemInstance) {
    const existingItem = this.items.find((i) =>
      areItemInstancesEqual(i, item, true)
    );
    if (!existingItem) return 0;

    if (existingItem.amount > item.amount) {
      existingItem.amount -= item.amount;
      if (existingItem.amount === 0) {
        this.items = this.items.filter((i) => i !== existingItem);
      }
      return item.amount;
    } else {
      this.items = this.items.filter((i) => i !== existingItem);
      return existingItem.amount;
    }
  }

  getMaxWeight() {
    return undefined;
  }

  getUsedWeight() {
    return this.items.reduce((acc, item) => {
      const itemDefinition = items[item.definitionId];
      return acc + itemDefinition.weight * item.amount;
    }, 0);
  }

  getById(itemId: ItemId) {
    return this.items.find((item) => item.definitionId === itemId);
  }
}
