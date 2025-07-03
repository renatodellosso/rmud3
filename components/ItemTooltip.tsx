import items from "lib/gamedata/items";
import { ItemTag } from "lib/types/itemenums";
import {
  EquipmentDefinition,
  equipmentSlotToMaxEquipped,
  ItemInstance,
} from "lib/types/item";
import { getFromOptionalFunc } from "../lib/utils";
import { CreatureInstance } from "lib/types/entities/creature";
import AbilityDescription from "./AbilityDescription";
import AbilityScore from "lib/types/AbilityScore";
import Ability from "lib/types/Ability";
import { DamageType } from "lib/types/Damage";
import reforges from "lib/gamedata/Reforges";

/**
 * Put the class "tooltip" on the element that should show the tooltip.
 * Put this component inside the element with class "tooltip".
 */
export default function ItemTooltip({
  item,
  creature,
  side,
}: {
  item: ItemInstance;
  creature: CreatureInstance;
  side?: "left" | "right";
}) {
  side ??= "left"; // Default to left if side is not provided

  const def = items[item.definitionId];

  const isEquipment = def.tags.includes(ItemTag.Equipment);

  const weight = getFromOptionalFunc(def.getWeight, item);
  const sellValue = getFromOptionalFunc(def.getSellValue, item);

  const hasAbilities = "getAbilities" in def && def.getAbilities;
  const abilities = hasAbilities
    ? getFromOptionalFunc(
        def.getAbilities as (
          creature: CreatureInstance,
          item: ItemInstance
        ) => Ability[],
        creature,
        item
      ).map((ability) => ({
        ability,
        source: item,
      }))
    : [];

  return (
    <span
      className={`tooltip-text ${
        side === "right" && "tooltip-text-right"
      } flex-col w-64 text-white`}
    >
      <h1 className="text-lg">
        {item.getName()} x{item.amount}
      </h1>
      {def.tags.length ? <div>Tags: {def.tags.join(", ")}</div> : <></>}
      <div>
        {(item.amount * weight).toFixed(1)} kg total, {weight.toFixed(1)} kg
        each
      </div>
      <div>
        Worth {item.amount * sellValue} {items["money"].getName as string}{" "}
        total, {sellValue} {items["money"].getName as string} each
      </div>
      <div>{def.description}</div>
      {isEquipment && (
        <EquipmentDescription equipment={item} creature={creature} />
      )}
      {hasAbilities ? (
        abilities.length > 0 ? (
          <div>
            <strong>Abilities</strong>
            {abilities.map((ability, index) => (
              <AbilityDescription
                key={index}
                abilityWithSource={ability}
                creature={creature}
              />
            ))}
          </div>
        ) : (
          <div>No abilities</div>
        )
      ) : (
        <></>
      )}
    </span>
  );
}

function EquipmentDescription({
  equipment,
  creature,
}: {
  equipment: ItemInstance;
  creature: CreatureInstance;
}) {
  const def = items[equipment.definitionId] as EquipmentDefinition;

  const abilityScores = def.getAbilityScores
    ? Object.keys(AbilityScore)
        .map((key) => {
          const score = AbilityScore[key as keyof typeof AbilityScore];
          const value = getFromOptionalFunc(
            def.getAbilityScores![key as keyof typeof AbilityScore],
            creature,
            equipment,
            score
          );
          return { score, value };
        })
        .filter(({ value }) => value != 0) // Filter out undefined values
    : [];

  const resistances = def.getDamageResistances
    ? getFromOptionalFunc(def.getDamageResistances, creature, equipment)
    : [];

  return (
    <div>
      <div>
        Slot:{" "}
        {def.slot
          ? `${def.slot} (Can equip up to ${
              equipmentSlotToMaxEquipped[def.slot]
            })`
          : "None"}
      </div>
      {abilityScores.length > 0 ? (
        <div>
          <strong>Ability Scores</strong>
          <ul>
            {abilityScores.map(({ score, value }) => (
              <li key={score}>
                {score}: {value >= 0 ? "+" : "-"}
                {value}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>No ability scores</div>
      )}
      {resistances.length > 0 ? (
        <div>
          <div>
            <strong>Resistances</strong> (type: reduction)
          </div>
          <ul>
            {resistances.map((resistance) => (
              <li key={resistance.type}>
                {resistance.type === "*" ? "All" : resistance.type}:{" "}
                {resistance.amount}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>No resistances</div>
      )}
      {equipment.reforge ? (
        <div>
          <strong>Reforge</strong>: {reforges[equipment.reforge].name}{" "}
          <div>
            {getFromOptionalFunc(
              reforges[equipment.reforge].getDescription,
              equipment
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
