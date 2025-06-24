import { EntityInstance, Interaction } from "lib/types/entity";
import Inventory from "lib/types/Inventory";
import { ItemInstance } from "lib/types/item";
import { PlayerInstance } from "lib/types/entities/player";
import { savePlayer } from "lib/utils";
import { EJSON } from "bson";

export default function inventoryInteraction(
  entity: EntityInstance,
  player: PlayerInstance,
  interaction: Interaction | undefined,
  action: any,
  inventory: Inventory,
  title: string
): Interaction | undefined {
  if (interaction === undefined) {
    // Initialize interaction if not provided
    return {
      entityId: entity._id,
      type: "container",
      inventory,
      title,
    };
  }

  if (action === "exit") return undefined;

  try {
    let parsedAction = EJSON.parse(action) as {
      item: ItemInstance;
      insert: boolean;
    };

    const item: ItemInstance = parsedAction.item;
    console.log("Processing inventory interaction:", parsedAction);
    const foundItem = parsedAction.insert
      ? player.inventory.get(item)
      : inventory.get(item);

    console.log("Found item:", foundItem);

    if (!foundItem) {
      return interaction;
    }

    foundItem.amount = Math.min(foundItem.amount, item.amount);

    if (!parsedAction.insert) {
      foundItem.amount = player.inventory.add(foundItem);
      inventory.remove(foundItem);
    } else {
      foundItem.amount = player.inventory.remove(foundItem);
      inventory.add(foundItem);
    }

    savePlayer(player);

    return {
      ...interaction,
      inventory,
    };
  } catch (error) {
    console.error("Error processing inventory interaction:", error);

    return interaction;
  }
}
