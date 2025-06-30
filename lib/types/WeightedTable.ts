import { ItemId } from "lib/gamedata/items";
import { randInRangeInt } from "lib/utils";
import { ItemInstance } from "./item";
import { Range } from "./types";

type WeightedTableEntry<T> = {
  item: T;
  amount: Range | number;
  weight: number;
};

export class WeightedTable<T> {
  public items: (WeightedTableEntry<T> & {
    upperBound: number;
  })[] = [];

  public totalWeight: number = 0;

  constructor(items: WeightedTableEntry<T>[]) {
    this.add(...items);
  }

  add(...items: WeightedTableEntry<T>[]) {
    for (const item of items) {
      const upperBound = this.totalWeight + item.weight;
      this.items.push({ ...item, upperBound });
      this.totalWeight = upperBound;
    }
  }

  /**
   * Get a random item from the table
   */
  roll(): { item: T; amount: number } {
    if (this.items.length === 0) {
      throw new Error("Cannot roll on an empty weighted table");
    }

    const roll = Math.random() * this.totalWeight;

    for (const item of this.items) {
      if (roll < item.upperBound) {
        const amount =
          typeof item.amount === "number"
            ? item.amount
            : randInRangeInt(item.amount[0], item.amount[1]);
        return { item: item.item, amount };
      }
    }

    throw new Error("No item found in weighted table, this should not happen");
  }
}
