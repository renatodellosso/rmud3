import { Interaction } from "lib/types/entity";
import Inventory from "../../lib/types/Inventory";
import { socket } from "lib/socket";
import items, { ItemId } from "lib/gamedata/items";
import ItemTooltip from "../ItemTooltip";
import { CreatureInstance } from "lib/types/entities/creature";
import { getFromOptionalFunc } from "../../lib/utils";
import { ItemInstance } from "../../lib/types/item";

export default function CraftingMenu({
  inventory,
  interaction,
  self,
}: {
  inventory: Inventory;
  interaction: Interaction;
  self: CreatureInstance;
}) {
  function craft(index: number) {
    socket.emit("interact", interaction.entityId.toString(), index);
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
      <div className="h-full overflow-y-scroll overflow-x-hidden">
        <table className="border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th>Input (in inventory)</th>
              <th>Output (in inventory)</th>
            </tr>
          </thead>
          <tbody>
            {interaction.recipes!.map((recipe, index) => (
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
                      {inventory.get(item)?.amount ?? 0})
                      <ItemTooltip item={item} creature={self} />
                    </span>
                  ))}
                </td>
                <td>
                  <button
                    onClick={() => craft(index)}
                    disabled={
                      !recipe.hasInput(inventory) ||
                      !recipe.hasRoomForOutput(inventory)
                    }
                    className="px-1"
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
