import { PlayerInstance } from "lib/types/entities/player";
import { EntityInstance, Interaction } from "lib/types/entity";
import reforges, { ReforgeId, reforgeTablesByType } from "../Reforges";
import items from "lib/gamedata/items";
import { EquipmentSlot } from "lib/types/itemenums";
import { EquipmentDefinition } from "lib/types/item";
import { getFromOptionalFunc, randInRangeInt } from "lib/utils";
import { ReforgeType } from "lib/types/Reforge";
import { getIo } from "lib/ClientFriendlyIo";

export const REFORGE_COST = 25;

export default function reforgeInteraction(
  entity: EntityInstance,
  player: PlayerInstance,
  interaction: Interaction | undefined,
  action: any,
  title: string
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

  const inventory = player.getCraftingInventory();

  if (typeof action !== "number") return interaction;
  else {
    if (
      !inventory.getById("money") ||
      inventory.getById("money")!.amount < REFORGE_COST
    ) {
      getIo().sendMsgToPlayer(
        player._id.toString(),
        `Can't afford to reforge, at least ${REFORGE_COST} ${items["money"].getName} are needed!`
      );
      return interaction;
    }

    const equipmentType: EquipmentSlot = (
      items[
        player.equipment.items.at(action)!.definitionId
      ] as EquipmentDefinition
    ).slot as EquipmentSlot;

    let reforgeType: ReforgeType = ReforgeType.Other;
    switch (equipmentType) {
      case EquipmentSlot.Hands:
        reforgeType = ReforgeType.Hand;
        break;
      case EquipmentSlot.Back:
      case EquipmentSlot.Chest:
      case EquipmentSlot.Legs:
      case EquipmentSlot.Head:
        reforgeType = ReforgeType.Armor;
        break;
    }

    const newReforge = getRandomReforge(reforgeType);

    player.equipment.items.at(action)!.reforge = newReforge;

    getIo().sendMsgToPlayer(
      player._id.toString(),
      `Reforged ${getFromOptionalFunc(
        items[player.equipment.items.at(action)!.definitionId].getName,
        player.equipment.items.at(action)!
      )} to ${reforges[newReforge].name}`
    );

    inventory.removeById("money", REFORGE_COST);

    return interaction;
  }
}

function getRandomReforge(type: ReforgeType): ReforgeId {
  return reforgeTablesByType[type].roll().item;
}
