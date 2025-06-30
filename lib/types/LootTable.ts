import { ItemId } from "lib/gamedata/items";
import { ItemInstance } from "./item";
import { WeightedTable } from "./WeightedTable";

type LootTableEntry = {
  item: WeightedTable<ItemId>;
  amount: number;
  chance: number;
};

export class LootTable {
  public entries: LootTableEntry[];

  constructor(entries: LootTableEntry[]) {
    this.entries = entries;
  }

  roll(): ItemInstance[] {
    if (this.entries.length === 0) {
      throw new Error("Cannot roll on an empty loot table");
    }

    const roll = Math.random();

    let rolledItems: ItemInstance[] = [];

    for (const entry of this.entries) {
      for (let i = 0; i < entry.amount; i++) {
        if (Math.random() <= entry.chance) {
          let rolledItem = entry.item.roll();

          rolledItems.push(
            new ItemInstance(rolledItem.item, rolledItem.amount)
          );
        }
      }
    }

    return rolledItems;
  }
}
