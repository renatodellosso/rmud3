import items from "lib/gamedata/items";
import { ItemTag } from "lib/types/itemenums";
import { PlayerInstance } from "../../lib/types/entities/player";
import ItemTooltip from "../ItemTooltip";
import {
  EquipmentDefinition,
  equipmentSlotToMaxEquipped,
  ItemInstance,
} from "lib/types/item";
import { socket } from "lib/socket";
import { getFromOptionalFunc } from "../../lib/utils";
import { useState } from "react";
import { EJSON } from "bson";
import useGameState from "lib/hooks/useGameState";

function ItemEntry({
  item,
  self,
  equip,
  setError,
}: {
  item: ItemInstance;
  self: PlayerInstance;
  equip: (item: ItemInstance) => void;
  setError: (error: string) => void;
}) {
  const [amount, setAmount] = useState(item.amount);

  function setValidAmount(amount: number) {
    if (amount > item.amount) {
      setError(`You can only transfer up to ${item.amount} of this item.`);
      return;
    }

    setError("");
    setAmount(amount);
  }

  function drop() {
    if (amount <= 0) {
      setError("You must drop at least one item.");
      return;
    }

    socket.emit("dropItem", EJSON.stringify({ ...item, amount }));
  }

  return (
    <tr className="hover:bg-gray-900">
      <td className="tooltip">
        {item.getName()}
        <ItemTooltip item={item} creature={self} />
      </td>
      <td>{item.amount}</td>
      <td>{getFromOptionalFunc(items[item.definitionId].getWeight, item)}</td>
      {items[item.definitionId].tags.includes(ItemTag.Equipment) && (
        <td>
          <button
            onClick={() => equip(item)}
            disabled={!self.equipment.canEquip(self, item)}
          >
            Equip
          </button>
        </td>
      )}
      <td className="flex justify-end">
        <input
          type="number"
          name="amount"
          placeholder="amount"
          value={amount.toString()}
          onChange={(e) => setValidAmount(e.target.valueAsNumber)}
          className="px-1 text-right max-w-1/3"
        />
        <button onClick={drop} className="px-1">
          Drop
        </button>
      </td>
    </tr>
  );
}

export default function InventoryMenu({ self }: { self: PlayerInstance }) {
  const [error, setError] = useState("");

  const inventory = self.inventory;

  function equip(item: ItemInstance) {
    socket.emit("equip", item);
  }

  function unequip(item: ItemInstance) {
    socket.emit("unequip", item);
  }

  return (
    <div className="border w-1/3">
      <div className="w-full">
        <h2 className="text-xl">
          Equipment ({self.equipment.items.length}/
          {self.equipment.getCapacity(self)})
        </h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>Item</th>
              <th>Slot</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {self.equipment.items
              .map(
                (item) =>
                  [item, items[item.definitionId] as EquipmentDefinition] as [
                    ItemInstance,
                    EquipmentDefinition
                  ]
              )
              .map(([item, def], index) => (
                <tr key={index} className="hover:bg-gray-900">
                  <td className="tooltip">
                    {item.getName()}
                    <ItemTooltip item={item} creature={self} />
                  </td>
                  <td>
                    {def.slot ? (
                      <div className="tooltip">
                        {def.slot}
                        <div className="tooltip-text w-max">
                          Can equip up to {equipmentSlotToMaxEquipped[def.slot]}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td>
                    <button onClick={() => unequip(item)}>Unequip</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="w-full">
        <h2 className="text-xl">
          Inventory ({inventory.getUsedWeight()}/
          {inventory.getMaxWeight() ?? "∞"} kg)
        </h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
              <th>Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            {inventory.getItems().map((item, index) => (
              <ItemEntry
                key={index}
                item={item}
                self={self}
                equip={equip}
                setError={setError}
              />
            ))}
          </tbody>
        </table>
        <div className="text-red-500">{error}</div>
      </div>
    </div>
  );
}
