import { Interaction } from "lib/types/entity";
import { socket } from "lib/socket";
import items from "lib/gamedata/items";
import { ItemInstance } from "lib/types/item";
import { useState } from "react";

export default function ContainerMenu({
  interaction,
}: {
  interaction: Interaction;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [viewPlayerInventory, setViewInventory] = useState(false);

  function transferItem(item: ItemInstance) {
    let amountN: number = 1;

    try {
      amountN = +amount;
    } catch (error) {
      setError("Enter a positive whole number");
      return;
    }

    if (amountN < 1) {
      setError("Enter a positive whole number");
      return;
    }

    if (amountN > item.amount) {
      setError("Cannot take more items than present (" + item.amount + ")");
      return;
    }

    setError("");

    item.amount = amountN;

    const itemData = {
      definitionId: item.definitionId,
      amount: amountN,
      insert: viewPlayerInventory,
    };

    socket.emit(
      "interact",
      interaction.entityId.toString(),
      JSON.stringify(itemData)
    );
  }

  function switchInventory() {
    if (!viewPlayerInventory) setViewInventory(true);
    else setViewInventory(false);

    socket.emit("interact", interaction.entityId.toString(), "switchInventory");
  }

  const openInventory = viewPlayerInventory
    ? interaction.playerInventory
    : interaction.interactionInventory;

  return (
    <div className="border w-1/3 flex flex-col gap-2">
      <div className="flex justify-between">
        <button onClick={switchInventory}>
          {viewPlayerInventory ? "Open Container" : "Open Inventory"}
        </button>
        <h1 className="text-xl">{interaction.title}</h1>
        <button
          onClick={() => {
            // Close the container interaction
            socket.emit("interact", interaction.entityId.toString(), "exit");
          }}
          className="px-1"
        >
          Exit
        </button>
      </div>
      <div>
        <div className="text-center">
          {viewPlayerInventory ? "Inventory" : "Container"} Items
        </div>
        <table className="w-full border-separate border-spacing-y-2">
          <tbody>
            {openInventory!.map((item, index) => (
              <tr key={index} className="hover:bg-gray-900">
                <td>
                  {items[item.definitionId].name} x{item.amount}
                </td>
                <td className="flex justify-end">
                  <input
                    type="text"
                    name="amount"
                    placeholder="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="px-1 text-right max-w-1/3"
                  />
                  <button onClick={() => transferItem(item)} className="px-1">
                    {viewPlayerInventory ? "Insert" : "Take"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
