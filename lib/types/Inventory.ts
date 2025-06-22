import items, { ItemId } from "../gamedata/items";
import { ItemInstance } from "./item";
import { areItemInstancesEqual, getFromOptionalFunc } from "../utils";
import { PlayerInstance } from "./entities/player";
import { AbilityScore } from "./types";

export default interface Inventory {
  /**
   * @returns how many items were added to the inventory before hitting the weight limit.
   */
  add(item: ItemInstance, ignoreWeight?: boolean): number;
  /**
   * Removes an item from the inventory.
   * If the item is not in the inventory, it will be ignored.
   * If the item is in the inventory but not enough of it, it will be removed completely.
   * @returns how many items were removed from the inventory.
   */
  remove(item: ItemInstance): number;
  /**
   * Removes an item from the inventory, comparing only IDs.
   * If the item is not in the inventory, it will be ignored.
   * If the item is in the inventory but not enough of it, it will be removed completely.
   * @returns how many items were removed from the inventory.
   */
  removeById(itemId: ItemId, amount: number): number;

  /**
   * @returns The maximum size of the inventory. If undefined, the inventory is unlimited.
   */
  getMaxWeight(): number | undefined;

  getUsedWeight(): number;
  get(item: ItemInstance): ItemInstance | undefined;
  getById(itemId: ItemId): ItemInstance | undefined;
  getCountById(itemId: ItemId): number;
  getItems(): ItemInstance[];
}

/**
 * An inventory that directly contains items.
 */
export class DirectInventory implements Inventory {
  items: ItemInstance[] = [];
  maxWeight: number | undefined;

  constructor(items: ItemInstance[] = [], maxWeight?: number) {
    this.items = items;
    this.maxWeight = maxWeight;
  }

  add(item: ItemInstance, ignoreWeight = false): number {
    const existingItem = this.items.find((i) => areItemInstancesEqual(i, item));

    const maxWeight = this.getMaxWeight();
    const usedWeight = this.getUsedWeight();

    const itemWeight = getFromOptionalFunc(
      items[item.definitionId].getWeight,
      item
    );

    const amountToAdd =
      maxWeight === undefined || ignoreWeight || itemWeight === 0
        ? item.amount
        : Math.min(
            Math.floor((maxWeight - usedWeight) / itemWeight),
            item.amount
          );

    if (amountToAdd === 0) return amountToAdd;

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

  removeById(itemId: ItemId, amount: number): number {
    const existingItem = this.items.find((i) => i.definitionId === itemId);
    if (!existingItem) return 0;

    if (existingItem.amount > amount) {
      existingItem.amount -= amount;
      if (existingItem.amount === 0) {
        this.items = this.items.filter((i) => i !== existingItem);
      }
      return amount;
    } else {
      this.items = this.items.filter((i) => i !== existingItem);
      return existingItem.amount;
    }
  }

  getMaxWeight() {
    return this.maxWeight;
  }

  getUsedWeight() {
    return this.items.reduce((acc, item) => {
      const itemDefinition = items[item.definitionId];
      return (
        acc + getFromOptionalFunc(itemDefinition.getWeight, item) * item.amount
      );
    }, 0);
  }

  get(item: ItemInstance): ItemInstance | undefined {
    return this.items.find((i) => areItemInstancesEqual(i, item, true));
  }

  getById(itemId: ItemId) {
    return this.items.find((item) => item.definitionId === itemId);
  }

  getCountById(itemId: ItemId): number {
    return this.items
      .filter((item) => item.definitionId === itemId)
      .reduce((acc, item) => acc + item.amount, 0);
  }

  getItems(): ItemInstance[] {
    return this.items;
  }
}
