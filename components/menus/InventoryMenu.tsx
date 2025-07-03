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
import { getFromOptionalFunc, isInTown } from "../../lib/utils";
import { useState } from "react";
import { EJSON } from "bson";
import Inventory from "lib/types/Inventory";

function ItemEntry({
  item,
  self,
  setError,
  canInteract,
}: {
  item: ItemInstance;
  self: PlayerInstance;
  setError: (error: string) => void;
  canInteract: boolean;
}) {
  const [amount, setAmount] = useState(item.amount);

  function setValidAmount(amount: number) {
    if (amount > item.amount) {
      setError(`You can only transfer up to ${item.amount} of this item.`);
      return;
    }

    if (amount < 1) {
      setError("You must transfer at least one item.");
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

  function equip(item: ItemInstance) {
    socket.emit("equip", item);
  }

  return (
    <tr className="hover:bg-gray-900 w-full">
      <td className="tooltip align-top">
        {item.getName()}
        <ItemTooltip item={item} creature={self} side={"right"} />
      </td>
      <td>{item.amount}</td>
      <td>{getFromOptionalFunc(items[item.definitionId].getWeight, item)}</td>
      {canInteract && (
        <>
          {items[item.definitionId].tags.includes(ItemTag.Equipment) ? (
            <td>
              <button
                onClick={() => equip(item)}
                disabled={!self.equipment.canEquip(self, item)}
              >
                Equip
              </button>
            </td>
          ) : (
            <td></td>
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
        </>
      )}
    </tr>
  );
}

function InventoryTable({
  inventory,
  canInteract,
  title,
  self,
}: {
  inventory: Inventory;
  canInteract: boolean;
  title: string;
  self: PlayerInstance;
}) {
  const [error, setError] = useState("");

  return (
    <div className="w-full">
      <h2 className="text-xl">
        {title} ({inventory.getUsedWeight().toFixed(1)}/
        {inventory.getMaxWeight()?.toFixed(1) ?? "∞"} kg)
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
              setError={setError}
              canInteract={canInteract}
            />
          ))}
        </tbody>
      </table>
      {canInteract && <div className="text-red-500">{error}</div>}
    </div>
  );
}

export default function InventoryMenu({ self }: { self: PlayerInstance }) {
  function unequip(item: ItemInstance) {
    socket.emit("unequip", item);
  }

  return (
    <div className="border w-1/3 overflow-y-scroll flex flex-col gap-4">
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
                    <ItemTooltip item={item} creature={self} side={"right"} />
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
      <InventoryTable
        inventory={self.inventory}
        canInteract={true}
        title="Inventory"
        self={self}
      />
      <InventoryTable
        inventory={self.vault.inventory}
        canInteract={false}
        title={`Vault${isInTown(self.location) ? " (Can Craft From)" : ""}`}
        self={self}
      />
    </div>
  );
}
