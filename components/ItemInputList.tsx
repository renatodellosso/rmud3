import { PlayerInstance } from "lib/types/entities/player";
import Inventory from "lib/types/Inventory";
import { ItemGroup } from "lib/types/Recipe";
import ItemTooltip from "./ItemTooltip";
import { ItemId } from "lib/gamedata/items";
import { ItemInstance } from "lib/types/item";

export default function ItemInputList({
  items,
  inventory,
  self,
}: {
  items: ItemGroup;
  inventory: Inventory;
  self: PlayerInstance;
}) {
  return (
    <>
      {Object.entries(items).map(([id, amt], index, arr) => (
        <span key={id}>
          <span
            className={`${
              inventory.getCountById(id as ItemId) < amt ? "text-red-500" : ""
            } tooltip`}
          >
            {new ItemInstance(id as ItemId, amt).getName()} x{amt} (
            {inventory.getCountById(id as ItemId)})
            <ItemTooltip
              item={new ItemInstance(id as ItemId, amt)}
              creature={self}
              side="right"
            />
          </span>
          {index < arr.length - 1 ? ", " : ""}
        </span>
      ))}
    </>
  );
}
