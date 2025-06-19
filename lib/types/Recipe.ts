import items, { ItemId } from "lib/gamedata/items";
import { PlayerInstance } from "./player";
import Inventory from "./Inventory";
import { ItemInstance } from "./item";
import { savePlayer } from "lib/utils";

type ItemGroup = {
  [key in ItemId]?: number;
};

export default class Recipe {
  input: ItemGroup;
  output: ItemInstance[];
  isAllowToCraft?: (player: PlayerInstance) => boolean;

  constructor(
    input: ItemGroup,
    output: ItemInstance[] | ItemInstance | ItemId,
    isAllowToCraft?: (player: PlayerInstance) => boolean
  ) {
    this.input = input;
    this.output = Array.isArray(output)
      ? output
      : typeof output === "object"
      ? [output]
      : [{ definitionId: output, amount: 1 }];
    this.isAllowToCraft = isAllowToCraft;
  }

  hasInput(inventory: Inventory): boolean {
    return Object.entries(this.input).every(
      ([itemId, quantity]) =>
        inventory.getCountById(itemId as ItemId) >= quantity
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
      inventory.removeById(itemId as ItemId, quantity);
    }

    for (const item of this.output) {
      inventory.add(structuredClone(item));
    }

    return true;
  }

  getInputText(): string {
    return Object.entries(this.input)
      .map(([itemId, quantity]) => {
        const itemDef = items[itemId as ItemId];
        return `${quantity}x ${itemDef.name}`;
      })
      .join(", ");
  }

  getOutputText(): string {
    return this.output
      .map((item) => {
        const itemDef = items[item.definitionId];
        return `${itemDef.name} ${item.amount}x`;
      })
      .join(", ");
  }
}

export class RecipeGroup {
  private recipes: Recipe[];

  constructor(recipes: Recipe[]) {
    this.recipes = recipes;
  }

  getAllowedRecipes(player?: PlayerInstance): Recipe[] {
    return player
      ? this.recipes.filter((r) => r.isAllowToCraft?.(player) ?? true)
      : this.recipes;
  }
}
