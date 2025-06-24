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
    let parsedAction = EJSON.parse(action);

    if (
      "definitionId" in parsedAction &&
      "amount" in parsedAction &&
      "insert" in parsedAction
    ) {
      const item: ItemInstance = {
        definitionId: parsedAction.definitionId,
        amount: parsedAction.amount,
      };

      if (!parsedAction.insert) {
        inventory.remove(item);
        player.inventory.add(item);
      } else {
        player.inventory.remove(item);
        inventory.add(item);
      }

      savePlayer(player);

      return {
        ...interaction,
        inventory,
      };
    }
  } catch {
    return interaction;
  }
}
