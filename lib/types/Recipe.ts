import items, { ItemId } from "lib/gamedata/items";
import { PlayerInstance } from "./entities/player";
import Inventory from "./Inventory";
import { ItemInstance } from "./item";
import { getFromOptionalFunc } from "../utils";

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
      : [new ItemInstance(output, 1)];
    this.isAllowToCraft = isAllowToCraft;
  }

  static fromCost(
    output: ItemInstance[] | ItemInstance | ItemId,
    isAllowedToCraft?: (player: PlayerInstance) => boolean
  ) {
    let totalCost = Array.isArray(output)
      ? output.reduce(
          (acc, item) =>
            acc +
            item.amount *
              getFromOptionalFunc(items[item.definitionId].getSellValue, item),
          0
        )
      : typeof output === "object"
      ? output.amount *
        getFromOptionalFunc(items[output.definitionId].getSellValue, output)
      : getFromOptionalFunc(items[output].getSellValue, 
          new ItemInstance(output, 1));

    return new Recipe(
      {
        money: totalCost,
      },
      output,
      isAllowedToCraft
    );
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
      const weight =
        getFromOptionalFunc(items[item.definitionId].getWeight, item) *
        item.amount;
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
        return `${quantity}x ${getFromOptionalFunc(itemDef.getName, 
          new ItemInstance(itemId as ItemId, quantity))}`;
      })
      .join(", ");
  }

  getOutputText(): string {
    return this.output
      .map((item) => {
        const itemDef = items[item.definitionId];
        return `${getFromOptionalFunc(itemDef.getName, item)} ${item.amount}x`;
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
