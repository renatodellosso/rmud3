import items from "lib/gamedata/items";
import { PlayerInstance } from "../../lib/types/entities/player";
import ItemTooltip from "../ItemTooltip";
import {
  EquipmentDefinition,
  equipmentSlotToMaxEquipped,
  ItemInstance,
  ItemTag,
} from "lib/types/item";
import { socket } from "lib/socket";
import { getFromOptionalFunc } from "../../lib/utils";

export default function InventoryMenu({ self }: { self: PlayerInstance }) {
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
                    {def.name}
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
              <tr key={index} className="hover:bg-gray-900">
                <td className="tooltip">
                  {items[item.definitionId].name}
                  <ItemTooltip item={item} creature={self} />
                </td>
                <td>{item.amount}</td>
                <td>
                  {getFromOptionalFunc(
                    items[item.definitionId].getWeight,
                    item
                  )}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
