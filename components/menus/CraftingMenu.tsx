import { Interaction } from "lib/types/entity";
import Inventory from "../../lib/types/Inventory";
import { socket } from "lib/socket";
import { ItemId } from "lib/gamedata/items";
import ItemTooltip from "../ItemTooltip";
import { ItemInstance } from "../../lib/types/item";
import { PlayerInstance } from "lib/types/entities/player";
import { useState } from "react";
import Recipe from "lib/types/Recipe";

export default function CraftingMenu({
  inventory,
  interaction,
  self,
}: {
  inventory: Inventory;
  interaction: Interaction;
  self: PlayerInstance;
}) {
  const [sortBy, setSortBy] = useState<
    "output name" | "input name" | "craftability"
  >("craftability");

  const comparator =
    sortBy === "output name"
      ? (a: Recipe, b: Recipe) =>
          a.getOutputText().localeCompare(b.getOutputText())
      : sortBy === "input name"
      ? (a: Recipe, b: Recipe) =>
          a.getInputText().localeCompare(b.getInputText())
      : (a: Recipe, b: Recipe) => {
          const aCanCraft =
            a.hasInput(inventory) && a.hasRoomForOutput(inventory);
          const bCanCraft =
            b.hasInput(inventory) && b.hasRoomForOutput(inventory);
          return (bCanCraft ? 1 : 0) - (aCanCraft ? 1 : 0);
        };

  function craft(index: number) {
    socket.emit("interact", interaction.entityId.toString(), index);
  }

  const sortedRecipes = interaction
    .recipes!.map((recipe, index) => ({
      recipe,
      originalIndex: index,
    }))
    .sort((a, b) => comparator(a.recipe, b.recipe));

  function headerClassName(sortType: typeof sortBy) {
    let className = "cursor-pointer";

    if (sortBy === sortType) {
      className += " border-b border-white";
    }

    return className;
  }

  return (
    <div className="border w-1/3 flex flex-col gap-2">
      <div className="flex justify-between">
        <h1 className="text-xl">{interaction.title}</h1>
        <button
          onClick={() => {
            // Close the crafting interaction
            socket.emit("interact", interaction.entityId.toString(), "exit");
          }}
          className="px-1"
        >
          Exit
        </button>
      </div>
      <div>Sorting by {sortBy}</div>
      <div className="h-full overflow-y-scroll overflow-x-hidden">
        <table className="border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th>
                <a
                  onClick={() => setSortBy("input name")}
                  className={headerClassName("input name")}
                >
                  Input
                </a>
              </th>
              <th>
                <a
                  onClick={() => setSortBy("output name")}
                  className={headerClassName("output name")}
                >
                  Output
                </a>
              </th>
              <th>
                <a
                  onClick={() => setSortBy("craftability")}
                  className={headerClassName("craftability")}
                >
                  Craft
                </a>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRecipes.map(({ recipe, originalIndex }, index) => (
              <tr key={index} className="hover:bg-gray-900">
                <td>
                  {Object.entries(recipe.input).map(([id, amt], index, arr) => (
                    <span key={id}>
                      <span
                        className={`${
                          inventory.getCountById(id as ItemId) < amt
                            ? "text-red-500"
                            : ""
                        } tooltip`}
                      >
                        {new ItemInstance(id as ItemId, amt).getName()} x{amt} (
                        {inventory.getCountById(id as ItemId)})
                        <ItemTooltip
                          item={new ItemInstance(id as ItemId, amt)}
                          creature={self}
                          side="right"
                        />
                      </span>
                      {index < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </td>
                <td
                  className={recipe.hasInput(inventory) ? "" : "text-red-500"}
                >
                  {recipe.output.map((item, index) => (
                    <span key={index} className="tooltip">
                      {item.getName()} x{item.amount} (
                      {inventory.getCount(item) ?? 0})
                      <ItemTooltip item={item} creature={self} />
                    </span>
                  ))}
                </td>
                <td>
                  <button
                    onClick={() => craft(originalIndex)}
                    disabled={
                      !recipe.hasInput(inventory) ||
                      !recipe.hasRoomForOutput(inventory)
                    }
                    className="px-1"
                    title={`${
                      !recipe.hasInput(inventory)
                        ? "Not enough input items. "
                        : ""
                    }${
                      !recipe.hasRoomForOutput(inventory)
                        ? "Not enough space for output items."
                        : ""
                    }`}
                  >
                    Craft
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
