import { ContainerInstance } from "lib/types/entities/container";
import { EntityInstance, Interaction } from "lib/types/entity";
import Inventory from "lib/types/Inventory";
import { PlayerInstance } from "lib/types/player";

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
        state: undefined
      };
    }

    if (action === "exit") return undefined;

    return interaction;
  }
}
