import { Interaction } from "lib/types/entity";
import { socket } from "lib/socket";
import items from "lib/gamedata/items";
import { ItemInstance } from "lib/types/item";
import { useState } from "react";
import ItemTooltip from "../ItemTooltip";
import { PlayerInstance } from "lib/types/entities/player";
import { CreatureInstance } from "lib/types/entities/creature";
import { getFromOptionalFunc } from "../../lib/utils";
import { EJSON } from "bson";

function ItemEntry({
  item,
  viewPlayerInventory,
  self,
  entityId,
  setError,
}: {
  item: ItemInstance;
  viewPlayerInventory: boolean;
  self: CreatureInstance;
  entityId: string;
  setError: (error: string) => void;
}) {
  const [amount, setAmount] = useState(item.amount);

  function transferItem(item: ItemInstance) {
    if (amount <= 0) {
      setError("You must transfer at least one item.");
      return;
    }

    const itemData = {
      item: {
        ...item,
        amount,
      },
      insert: viewPlayerInventory,
    };

    socket.emit("interact", entityId, EJSON.stringify(itemData));
  }

  function setValidAmount(amount: number) {
    if (amount > item.amount) {
      setError(`You can only transfer up to ${item.amount} of this item.`);
      return;
    }

    setError("");
    setAmount(amount);
  }

  return (
    <tr className="hover:bg-gray-900">
      <td>
        <div className="tooltip">
          {item.getName()} x
          {item.amount}
          <ItemTooltip item={item} creature={self} />
        </div>
      </td>
      <td className="flex justify-end">
        <input
          type="number"
          name="amount"
          placeholder="amount"
          value={amount.toString()}
          onChange={(e) => setValidAmount(e.target.valueAsNumber)}
          className="px-1 text-right max-w-1/3"
        />
        <button onClick={() => transferItem(item)} className="px-1">
          {viewPlayerInventory ? "Insert" : "Take"}
        </button>
      </td>
    </tr>
  );
}

export default function ContainerMenu({
  interaction,
  self,
}: {
  interaction: Interaction;
  self: PlayerInstance;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [viewPlayerInventory, setViewInventory] = useState(false);

  function switchInventory() {
    if (!viewPlayerInventory) setViewInventory(true);
    else setViewInventory(false);

    socket.emit("interact", interaction.entityId.toString(), "switchInventory");
  }

  const openInventory = viewPlayerInventory
    ? self.inventory
    : interaction.inventory;

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
          {viewPlayerInventory ? "Inventory" : "Container"} Items (
          {openInventory!.getUsedWeight()}/
          {openInventory!.getMaxWeight() ?? "∞"} kg)
        </div>
        <table className="w-full border-separate border-spacing-y-2">
          <tbody>
            {openInventory!.getItems().map((item, index) => (
              <ItemEntry
                key={index}
                item={item}
                viewPlayerInventory={viewPlayerInventory}
                self={self}
                entityId={interaction.entityId.toString()}
                setError={setError}
              />
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
