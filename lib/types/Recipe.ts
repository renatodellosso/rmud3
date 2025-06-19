import items, { ItemId } from "lib/gamedata/items";
import { PlayerInstance } from "./player";
import Inventory from "./Inventory";
import { ItemInstance } from "./item";

type ItemGroup = {
  [key in ItemId]?: number;
};

export default class Recipe {
  input: ItemGroup;
  output: ItemInstance[];
  canCraft?: (player: PlayerInstance) => boolean;

  constructor(
    input: ItemGroup,
    output: ItemInstance[] | ItemInstance | ItemId,
    canCraft?: (player: PlayerInstance) => boolean
  ) {
    this.input = input;
    this.output = Array.isArray(output)
      ? output
      : typeof output === "object"
      ? [output]
      : [{ definitionId: output, amount: 1 }];
    this.canCraft = canCraft;
  }

  hasInput(inventory: Inventory): boolean {
    return Object.entries(this.input).every(
      ([itemId, quantity]) =>
        inventory.getById(itemId as ItemId)?.amount ?? 0 >= quantity
    );
  }

  hasRoomForOutput(inventory: Inventory): boolean {
    const maxWeight = inventory.getMaxWeight();
    if (maxWeight === undefined) {
      return true; // No weight limit, always has room
    }

    const totalWeight = this.output.reduce((acc, item) => {
      const weight = items[item.definitionId].weight * item.amount;
      return acc + weight;
    }, inventory.getUsedWeight());

    return totalWeight <= maxWeight;
  }

  /**
   * @returns true if the crafting was successful, false otherwise.
   */
  craft(inventory: Inventory): boolean {
    if (!this.hasInput(inventory) || !this.hasRoomForOutput(inventory)) {
      return false;
    }

    for (const [itemId, quantity] of Object.entries(this.input)) {
      const item = inventory.getById(itemId as ItemId);
      if (item) {
        inventory.remove({ ...item, amount: quantity });
      }
    }

    for (const item of this.output) {
      inventory.add(structuredClone(item));
    }

    return true;
  }
}

export class RecipeGroup {
  private recipes: Recipe[];

  constructor(recipes: Recipe[]) {
    this.recipes = recipes;
  }

  getCraftableRecipes(player?: PlayerInstance): Recipe[] {
    return player
      ? this.recipes.filter((r) => r.canCraft?.(player) ?? true)
      : this.recipes;
  }
}
