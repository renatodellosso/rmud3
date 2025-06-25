import { getIo } from "lib/ClientFriendlyIo";
import { EntityInstance, Interaction } from "lib/types/entity";
import { PlayerInstance } from "lib/types/entities/player";
import { RecipeGroup } from "lib/types/Recipe";
import { savePlayer } from "lib/utils";

export default function craftingInteraction(
  title: string,
  recipes: RecipeGroup
): (
  entity: EntityInstance,
  player: PlayerInstance,
  interaction: Interaction | undefined,
  action: any
) => Promise<Interaction | undefined> {
  return (
    entity: EntityInstance,
    player: PlayerInstance,
    interaction: Interaction | undefined,
    action: any
  ): Promise<Interaction | undefined> => {
    if (interaction === undefined) {
      // Initialize interaction if not provided
      return Promise.resolve({
        entityId: entity._id,
        type: "crafting",
        title,
        recipes: recipes.getAllowedRecipes(player),
      });
    } else interaction.recipes = recipes.getAllowedRecipes(player); // Always keep recipes updated

    if (action === "exit") return Promise.resolve(undefined); // Close the interaction

    if (typeof action !== "number") return Promise.resolve(interaction);

    if (action < 0 || action >= recipes.getAllowedRecipes(player).length) {
      return Promise.resolve(interaction); // Invalid action index
    }

    const recipe = recipes.getAllowedRecipes(player)[action];
    if (!recipe) {
      return Promise.resolve(interaction); // No recipe found for the action
    }

    if (recipe.isAllowToCraft && !recipe.isAllowToCraft(player)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `You are not allowed to craft ${recipe.getOutputText()}.`
      );
      return Promise.resolve(interaction); // Player is not allowed to craft this recipe
    }

    if (!recipe.hasInput(player.inventory)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `You do not have the required items to craft ${recipe.getOutputText()}.`
      );
      return Promise.resolve(interaction); // Crafting failed due to insufficient items
    }

    if (!recipe.hasRoomForOutput(player.inventory)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `You do not have enough room in your inventory to craft ${recipe.getOutputText()}.`
      );
      return Promise.resolve(interaction); // Crafting failed due to insufficient inventory space
    }

    if (!recipe.craft(player.inventory)) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `Failed to craft: ${recipe.getOutputText()}.`
      );
      return Promise.resolve(interaction); // Crafting failed due to insufficient items
    }

    getIo().sendMsgToPlayer(
      player._id.toString(),
      `You successfully crafted ${recipe.getOutputText()}.`
    );

    savePlayer(player);

    return Promise.resolve(interaction);
  };
}
