import items from "lib/gamedata/items";
import { PlayerInstance } from "../../lib/types/player";
export default function InventoryMenu({ self }: { self: PlayerInstance }) {
  const inventory = self.inventory;

  return (
    <div className="border w-1/6 flex flex-col gap-2">
      <h1 className="text-xl">
        Inventory ({inventory.getUsedWeight()}/
        {inventory.getMaxWeightFromPlayer(self) ?? "∞"} kg)
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
          {inventory.items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-900">
              <td>{items[item.definitionId].name}</td>
              <td>{item.amount}</td>
              <td>{items[item.definitionId].weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
