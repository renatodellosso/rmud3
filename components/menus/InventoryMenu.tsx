import items from "lib/gamedata/items";
import { PlayerInstance } from "../../lib/types/player";
import ItemTooltip from "../ItemTooltip";

export default function InventoryMenu({ self }: { self: PlayerInstance }) {
  const inventory = self.inventory;

  return (
    <div className="border w-1/6 flex flex-col gap-2">
      <h1 className="text-xl">
        Inventory ({inventory.getUsedWeight()}/{inventory.getMaxWeight() ?? "∞"}{" "}
        kg)
      </h1>
      <table>
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
                <ItemTooltip item={item} />
              </td>
              <td>{item.amount}</td>
              <td>{items[item.definitionId].weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
