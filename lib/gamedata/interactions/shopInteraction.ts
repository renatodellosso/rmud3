import { PlayerInstance } from "lib/types/entities/player";
import { EntityInstance, Interaction } from "lib/types/entity";
import items, { ItemId } from "../items";
import craftingInteraction from "./craftingInteraction";
import Recipe, { RecipeGroup } from "lib/types/Recipe";
import { ItemInstance } from "lib/types/item";
import { getFromOptionalFunc } from "lib/utils";

const DISCOUNT = 0.2; // 20% discount

const itemsByMinLevel: Record<number, { markUp: number; items: ItemId[] }> = {
  10: {
    markUp: 1.5,
    items: ["meat", "mushroom", "bottle"],
  },
  15: {
    markUp: 2,
    items: ["coal", "bone", "slime", "eyeball"],
  },
  20: {
    markUp: 3,
    items: ["rottenFlesh", "ironOre"],
  },
  30: {
    markUp: 4,
    items: ["salt", "memory", "ectoplasm", "trollTooth", "trollHeart"],
  },
  40: {
    markUp: 5,
    items: ["goldOre", "venom"],
  },
  50: {
    markUp: 6,
    items: ["discountToken"],
  },
};

function itemIdToRecipe(
  itemId: ItemId,
  markUp: number,
  discount: boolean
): Recipe {
  const instance = new ItemInstance(itemId, 1);
  const sellPrice = Math.round(
    getFromOptionalFunc(items[itemId].getSellValue, instance) *
      markUp *
      (discount ? 1 - DISCOUNT : 1)
  );

  return new Recipe(
    {
      money: sellPrice,
    },
    instance
  );
}

function getRecipeGroup(player: PlayerInstance): RecipeGroup {
  const recipes: Recipe[] = [];
  const hasDiscount = player.inventory.getCountById("discountToken") > 0;

  for (const tier of Object.entries(itemsByMinLevel)) {
    const level = parseInt(tier[0]);
    if (level > player.level) continue; // Skip items above player's level

    const items = tier[1].items.map((itemId) =>
      itemIdToRecipe(itemId, tier[1].markUp, hasDiscount)
    );

    recipes.push(...items);
  }

  return new RecipeGroup(recipes);
}

export default function shopInteraction(
  entity: EntityInstance,
  player: PlayerInstance,
  interaction: Interaction | undefined,
  action: any
): Promise<Interaction | undefined> {
  const func = craftingInteraction("Shop", getRecipeGroup(player));

  return func(entity, player, interaction, action);
}
