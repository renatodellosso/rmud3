import items, { ItemId } from "./gamedata/items";
import { ItemDefinition, ItemInstance } from "./types/item";
import { getFromOptionalFunc } from "./utils";

export function itemNameToId(itemName: string): ItemId | undefined {
  for (const item of Object.entries(items)) {
    const [id, def] = item as [ItemId, ItemDefinition];
    const name = getFromOptionalFunc(def.getName, new ItemInstance(id, 1));

    if (name && name.toLowerCase() === itemName.toLowerCase()) {
      return id;
    }
  }
}
