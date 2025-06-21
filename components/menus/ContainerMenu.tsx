import { Interaction } from "lib/types/entity";
import { socket } from "lib/socket";
import items from 'lib/gamedata/items';
import { ItemInstance } from "lib/types/item";
import { useState } from "react";

export default function ContainerMenu({
  interaction
}: {
  interaction: Interaction;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [viewInventory, setViewInventory] = useState(false);

  function takeItem(item: ItemInstance) {
    let amountN: number = 1;

    try {
      amountN = +amount;
    }
    catch (error) {
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

    socket.emit("interact", interaction.entityId.toString(), JSON.stringify(item));
  }

  function switchInventory() {
    if (!viewInventory) setViewInventory(true);
    else setViewInventory(false);

    socket.emit("interact", interaction.entityId.toString(), "switchInventory");
  }

  return (
    <div className="border w-1/3 flex flex-col gap-2">
      <div className="flex justify-between">
        <button onClick={switchInventory}>
          {viewInventory ? "Open Container" : "Open Inventory"}
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
      {viewInventory ? (
        <table className="border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th>Inventory Items</th>
            </tr>
          </thead>
          <tbody>
            
          </tbody>
        </table>
      ) : (
        <table className="border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th>Container Items</th>
            </tr>
          </thead>
          <tbody>
            {interaction.inventory!.map((item, index) => (
              <tr key={index} className="hover:bg-gray-900">
                <td>
                  {items[item.definitionId].name} x{item.amount}
                </td>
                <td>
                  <input
                    type="text"
                    name="amount"
                    placeholder="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="px-1"
                  />
                </td>
                <td>
                  <button onClick={() => takeItem(item)} className="px-1">
                    Take
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}