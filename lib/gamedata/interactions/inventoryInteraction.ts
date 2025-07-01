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
    const foundItem = EJSON.parse(
      EJSON.stringify(
        parsedAction.insert ? player.inventory.get(item) : inventory.get(item)
      )
    );

    if (!foundItem) {
      return interaction;
    }

    foundItem.amount = Math.min(foundItem.amount, item.amount);

    if (!parsedAction.insert) {
      foundItem.amount = player.inventory.add(foundItem);
      inventory.remove(foundItem);
    } else {
      foundItem.amount = inventory.add(foundItem);
      player.inventory.remove(foundItem);
    }

    console.log(
      `Inventory interaction: ${parsedAction.insert ? "Added" : "Removed"}:`,
      foundItem
    );

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
