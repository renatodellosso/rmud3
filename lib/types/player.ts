import { ObjectId } from "bson";
import { CreatureInstance } from "./creature";
import Inventory, { DirectInventory } from "./Inventory";
import {
  AbilityScore,
  CannotDirectlyCreateInstanceError,
  OmitType,
  PlayerSave,
} from "./types";
import { EquipmentDefinition, ItemInstance, ItemTag } from "./item";
import Ability, { AbilitySource, AbilityWithSource } from "./Ability";
import items from "lib/gamedata/items";
import { ConsumableHotbar, EquipmentHotbar } from "./Hotbar";
import { getFromOptionalFunc, restoreFieldsAndMethods } from "lib/utils";

export class PlayerInstance extends CreatureInstance {
  progressId: ObjectId = undefined as unknown as ObjectId;

  definitionId: "player" = "player";

  abilityScores: { [score in AbilityScore]: number } = {
    [AbilityScore.Strength]: 0,
    [AbilityScore.Constitution]: 0,
    [AbilityScore.Intelligence]: 0,
  };

  xp: number = 0;

  inventory: Inventory = new DirectInventory();
  equipment: EquipmentHotbar = new EquipmentHotbar();
  consumables: ConsumableHotbar = new ConsumableHotbar();

  getMaxHealth(): number {
    let val = super.getMaxHealth();

    for (const equipment of this.equipment.items) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.getMaxHealth) continue;

      val += getFromOptionalFunc(def.getMaxHealth, this, equipment);
    }

    return val;
  }

  getAbilityScore(score: AbilityScore) {
    let val = this.abilityScores[score] + super.getAbilityScore(score);

    for (const equipment of this.equipment.items) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.abilityScores || !def.abilityScores[score]) continue;

      val += getFromOptionalFunc(def.abilityScores[score]!, this, equipment);
    }

    return val;
  }

  getAbilities(): AbilityWithSource[] {
    const abilities = super.getAbilities();

    for (const equipment of this.equipment.items.concat(
      this.consumables.items
    )) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.getAbilities) continue;

      abilities.push(
        ...getFromOptionalFunc(def.getAbilities, this, equipment).map(
          (ability) => ({
            ability,
            source: equipment,
          })
        )
      );
    }
    return abilities;
  }
}

/**
 * All player data that is not directly related to the player creature.
 */
export type PlayerProgress = {
  _id: ObjectId;

  playerInstanceId: ObjectId;
};

export function getDefaultPlayerAndProgress(): PlayerSave {
  const instance: PlayerInstance = {
    _id: new ObjectId(),
    name: "Player",
    location: "docks",
    progressId: new ObjectId(),
    definitionId: "player",
    abilityScores: {
      Strength: 0,
      Constitution: 0,
      Intelligence: 0,
    },
    xp: 0,
    inventory: new DirectInventory(),
    equipment: new EquipmentHotbar(),
    consumables: new ConsumableHotbar(),
    health: 0,
    canActAt: new Date(),
    lastActedAt: new Date(),
  } as OmitType<PlayerInstance, Function> as PlayerInstance;

  restoreFieldsAndMethods(instance, new PlayerInstance());

  instance.health = instance.getMaxHealth();

  instance.equipment.equip(instance, {
    definitionId: "rustySword",
    amount: 1,
  });

  const progress: PlayerProgress = {
    _id: instance.progressId,
    playerInstanceId: instance._id,
  };

  return {
    instance: instance as PlayerInstance,
    progress,
  };
}
