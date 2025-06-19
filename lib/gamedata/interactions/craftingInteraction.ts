import { getIo } from "lib/ClientFriendlyIo";
import { EntityInstance, Interaction } from "lib/types/entity";
import { PlayerInstance } from "lib/types/player";
import { RecipeGroup } from "lib/types/Recipe";

export default function craftingInteraction(
  recipes: RecipeGroup
): (
  entity: EntityInstance,
  player: PlayerInstance,
  interaction: Interaction | undefined,
  action: any
) => Interaction | undefined {
  return (
    entity: EntityInstance,
    player: PlayerInstance,
    interaction: Interaction | undefined,
    action: any
  ): Interaction | undefined => {
    if (interaction === undefined) {
      // Initialize interaction if not provided
      return {
        entityId: entity._id,
        type: "crafting",
      };
    }

    if (action === "exit") return undefined; // Close the interaction

    if (typeof action !== "number") return interaction;

    if (action < 0 || action >= recipes.getAllowedRecipes(player).length) {
      return interaction; // Invalid action index
    }

    const recipe = recipes.getAllowedRecipes(player)[action];
    if (!recipe) {
      return interaction; // No recipe found for the action
    }

    if (recipe.isAllowToCraft && !recipe.isAllowToCraft(player)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `You are not allowed to craft ${recipe.getOutputText()}.`
      );
      return interaction; // Player is not allowed to craft this recipe
    }

    if (!recipe.hasInput(player.inventory)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `You do not have the required items to craft ${recipe.getOutputText()}.`
      );
      return interaction; // Crafting failed due to insufficient items
    }

    if (!recipe.hasRoomForOutput(player.inventory)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `You do not have enough room in your inventory to craft ${recipe.getOutputText()}.`
      );
      return interaction; // Crafting failed due to insufficient inventory space
    }

    if (!recipe.craft(player.inventory)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `Failed to craft: ${recipe.getOutputText()}.`
      );
      return interaction; // Crafting failed due to insufficient items
    }

    getIo().sendMsgToPlayer(
      player._id.toString(),
      `You successfully crafted ${recipe.getOutputText()}.`
    );

    return interaction;
  };
}
