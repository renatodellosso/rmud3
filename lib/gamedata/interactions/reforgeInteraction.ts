import { PlayerInstance } from "lib/types/entities/player";
import { EntityInstance, Interaction } from "lib/types/entity";
import reforges, { ReforgeId } from "../Reforges";
import items from 'lib/gamedata/items';
import { EquipmentDefinition, EquipmentSlot } from "lib/types/item";
import { randInRangeInt } from "lib/utils";
import { ReforgeType } from "lib/types/Reforge";
import { getIo } from "lib/ClientFriendlyIo";

export default function reforgeInteraction(
  entity: EntityInstance,
  player: PlayerInstance,
  interaction: Interaction | undefined,
  action: any,
  title: string,
): Interaction | undefined {
  if (interaction === undefined) {
    // Initialize interaction if not provided
    return {
      entityId: entity._id,
      type: "reforge",
      title,
    };
  }

  if (action === "exit") return undefined;

  if (typeof action !== "number") return interaction;
  else {
    const equipmentType: EquipmentSlot = (items[player.equipment.items.at(action)!.definitionId] as EquipmentDefinition).slot as EquipmentSlot;

    let reforgeList = Array.from(Object.keys(reforges));

    let newReforge: ReforgeId = reforgeList.at(
      randInRangeInt(0, reforgeList.length - 1)
    ) as ReforgeId;

    while (
      !((
        reforges[newReforge].type === ReforgeType.Hand &&
        equipmentType === EquipmentSlot.Hands
      ) ||
      (
        reforges[newReforge].type === ReforgeType.Armor &&
        (equipmentType === EquipmentSlot.Head ||
          equipmentType === EquipmentSlot.Chest ||
          equipmentType === EquipmentSlot.Legs)
      ) ||
      (
        reforges[newReforge].type === ReforgeType.Other &&
        equipmentType === undefined
      ))
    ) {
      newReforge = reforgeList.at(
        randInRangeInt(0, reforgeList.length - 1)
      ) as ReforgeId;
    }

    player.equipment.items.at(action)!.reforge = newReforge;

    getIo().sendMsgToPlayer(
      player._id.toString(),
      `Reforged ${items[player.equipment.items.at(action)!.definitionId].getName} to ${reforges[newReforge].name}`
    );

    return interaction;
  }
}