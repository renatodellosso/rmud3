import { ContainerInstance } from "lib/types/entities/container";
import { EntityInstance, Interaction } from "lib/types/entity";
import Inventory from "lib/types/Inventory";
import { ItemInstance } from "lib/types/item";
import { PlayerInstance } from "lib/types/entities/player";

export default function containerInteraction(): (
  entity: ContainerInstance,
  player: PlayerInstance,
  interaction: Interaction | undefined,
  action: any
) => Interaction | undefined {
  return (
    entity: ContainerInstance,
    player: PlayerInstance,
    interaction: Interaction | undefined,
    action: any
  ): Interaction | undefined => {
    if (interaction === undefined) {
      // Initialize interaction if not provided
      return {
        entityId: entity._id,
        type: "container",
        inventory: entity.inventory.getItems(),
      };
    }

    if (action === "exit") return undefined;

    let parsedAction = JSON.parse(action);

    if ("definitionId" in parsedAction && "amount" in parsedAction) {
      let item: ItemInstance = parsedAction as ItemInstance;

      entity.inventory.remove(item);

      player.inventory.add(item);

      return {
        ...interaction,
        inventory: entity.inventory.getItems(),
      };
    }

    return interaction;
  };
}
