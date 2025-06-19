import { Interaction } from "lib/types/entity";
import Inventory from "../../lib/types/Inventory";
import { socket } from "lib/socket";
import items, { ItemId } from "lib/gamedata/items";

export default function CraftingMenu({
  inventory,
  interaction,
}: {
  inventory: Inventory;
  interaction: Interaction;
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
                      className={
                        inventory.getCountById(id as ItemId) < amt
                          ? "text-red-500"
                          : ""
                      }
                    >
                      {items[id as ItemId].name} x{amt} (
                      {inventory.getCountById(id as ItemId)})
                    </span>
                    {index < arr.length - 1 ? ", " : ""}
                  </span>
                ))}
              </td>
              <td>
                {recipe.output.map((item, index) => (
                  <span key={index}>
                    {items[item.definitionId].name} x{item.amount} (
                    {inventory.get(item)?.amount ?? 0})
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
  );
}
