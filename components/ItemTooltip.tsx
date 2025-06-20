import items from "lib/gamedata/items";
import { ItemInstance } from "lib/types/item";
import { getFromOptionalFunc } from "../lib/utils";

/**
 * Put the class "tooltip" on the element that should show the tooltip.
 * Put this component inside the element with class "tooltip".
 */
export default function ItemTooltip({ item }: { item: ItemInstance }) {
  const def = items[item.definitionId];

  return (
    <span className="tooltip-text flex-col w-64 text-white">
      <h1 className="text-lg">
        {def.name} x{item.amount}
      </h1>
      <div>{getFromOptionalFunc(def.getWeight, item)} kg</div>
      <div>{def.description}</div>
    </span>
  );
}
