import items from "lib/gamedata/items";
import { ItemInstance } from "lib/types/item";

/**
 * Put the class "tooltip" on the element that should show the tooltip.
 * Put this component inside the element with class "tooltip".
 */
export default function ItemTooltip({ item }: { item: ItemInstance }) {
  const def = items[item.definitionId];

  return (
    <span className="tooltip-text flex-col w-64">
      <h1 className="text-lg">{def.name}</h1>
      <div>{def.weight} kg</div>
      <div>{def.description}</div>
    </span>
  );
}
