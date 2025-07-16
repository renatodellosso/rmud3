import Inventory from "lib/types/Inventory";
import { ItemInstance } from "lib/types/item";
import ItemTooltip from "./ItemTooltip";
import { PlayerInstance } from "lib/types/entities/player";

export default function ItemOutputList({
  items,
  inventory,
  self,
}: {
  items: ItemInstance[];
  inventory: Inventory;
  self: PlayerInstance;
}) {
  return (
    <>
      {items.map((item, index) => (
        <span key={index} className="tooltip">
          {item.getName()} x{item.amount} ({inventory.getCount(item) ?? 0})
          <ItemTooltip item={item} creature={self} />
        </span>
      ))}
    </>
  );
}
