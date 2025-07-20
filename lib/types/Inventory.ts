import items, { ItemId } from "../gamedata/items";
import { ItemInstance } from "./item";
import {
  areItemInstancesEqual,
  getFromOptionalFunc,
  restoreFieldsAndMethods,
} from "../utils";
import { EJSON } from "bson";

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
  getCount(item: ItemInstance): number;
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
      existingItem.canActAt.setTime(
        Math.max(item.canActAt.getTime(), existingItem.canActAt.getTime())
      );
      existingItem.lastActedAt.setTime(
        Math.max(item.lastActedAt.getTime(), existingItem.lastActedAt.getTime())
      );
    } else {
      this.items.push(
        restoreFieldsAndMethods(
          EJSON.parse(
            EJSON.stringify({
              ...item,
              amount: amountToAdd,
            })
          ),
          new ItemInstance(item.definitionId, item.amount)
        )
      );
    }

    return amountToAdd;
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

  getCount(item: ItemInstance): number {
    return this.items
      .filter((i) => areItemInstancesEqual(i, item, true))
      .reduce((acc, i) => acc + i.amount, 0);
  }

  getItems(): ItemInstance[] {
    return this.items;
  }
}

export class MultipleInventory implements Inventory {
  constructor(private inventories: Inventory[]) {}

  add(item: ItemInstance, ignoreWeight?: boolean): number {
    let totalAdded = 0;
    let remainingAmount = item.amount;

    for (const inventory of this.inventories) {
      const toAdd = restoreFieldsAndMethods(
        EJSON.parse(EJSON.stringify(item)),
        new ItemInstance(item.definitionId, item.amount)
      );
      toAdd.amount = remainingAmount;

      const added = inventory.add(toAdd, ignoreWeight);

      totalAdded += added;
      if (added < item.amount) {
        remainingAmount -= added;
        if (remainingAmount <= 0) {
          break; // Item fully added
        }
      } else {
        break; // Item fully added
      }
    }

    return totalAdded;
  }

  remove(item: ItemInstance): number {
    let totalRemoved = 0;
    for (const inventory of this.inventories) {
      const removed = inventory.remove(item);
      totalRemoved += removed;
      if (removed < item.amount) {
        item.amount -= removed;
      } else {
        break; // Item fully removed
      }
    }

    return totalRemoved;
  }

  removeById(itemId: ItemId, amount: number): number {
    let totalRemoved = 0;
    for (const inventory of this.inventories) {
      const removed = inventory.removeById(itemId, amount);
      totalRemoved += removed;
      if (removed < amount) {
        amount -= removed;
      } else {
        break; // Item fully removed
      }
    }
    return totalRemoved;
  }

  getMaxWeight(): number | undefined {
    return this.inventories.reduce((maxWeight, inventory) => {
      const inventoryMaxWeight = inventory.getMaxWeight();
      if (maxWeight === undefined || inventoryMaxWeight === undefined) {
        return undefined; // If any inventory is unlimited, the whole is unlimited
      }

      return maxWeight + inventoryMaxWeight;
    }, 0 as number | undefined);
  }

  getUsedWeight(): number {
    return this.inventories.reduce(
      (usedWeight, inventory) => usedWeight + inventory.getUsedWeight(),
      0
    );
  }

  get(item: ItemInstance): ItemInstance | undefined {
    return this.inventories.reduce(
      (foundItem, inventory) => foundItem ?? inventory.get(item),
      undefined as ItemInstance | undefined
    );
  }

  getById(itemId: ItemId): ItemInstance | undefined {
    return this.inventories.reduce(
      (foundItem, inventory) => foundItem ?? inventory.getById(itemId),
      undefined as ItemInstance | undefined
    );
  }

  getCountById(itemId: ItemId): number {
    return this.inventories.reduce(
      (count, inventory) => count + inventory.getCountById(itemId),
      0
    );
  }

  getCount(item: ItemInstance): number {
    return this.inventories.reduce(
      (count, inventory) => count + inventory.getCount(item),
      0
    );
  }

  getItems(): ItemInstance[] {
    return this.inventories.reduce(
      (items, inventory) => items.concat(inventory.getItems()),
      [] as ItemInstance[]
    );
  }
}
