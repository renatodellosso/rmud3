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
import Ability from "./Ability";
import items from "lib/gamedata/items";
import { ConsumableHotbar, EquipmentHotbar } from "./Hotbar";
import { restoreFieldsAndMethods } from "lib/utils";

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

  constructor() {
    super();
  }

  getMaxHealth(): number {
    let val = super.getMaxHealth();

    for (const equipment of this.equipment.items) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.getMaxHealth) continue;

      if (typeof def.getMaxHealth === "function") {
        val += def.getMaxHealth(this, equipment);
      } else {
        val += def.getMaxHealth;
      }
    }

    return val;
  }

  getAbilityScore(score: AbilityScore) {
    let val = this.abilityScores[score] + super.getAbilityScore(score);

    for (const equipment of this.equipment.items) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.abilityScores || !def.abilityScores[score]) continue;

      if (typeof def.abilityScores[score] === "function") {
        val += def.abilityScores[score](this, equipment);
      } else {
        val += def.abilityScores[score];
      }
    }

    return val;
  }

  getAbilities(): Ability[] {
    const abilities = super.getAbilities();

    for (const equipment of this.equipment.items.concat(
      this.consumables.items
    )) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (Array.isArray(def.getAbilities)) {
        abilities.push(...def.getAbilities);
      } else if (typeof def.getAbilities === "function") {
        abilities.push(...def.getAbilities(this, equipment));
      }
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
  const instance: OmitType<PlayerInstance, Function> = {
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
  };

  const progress: PlayerProgress = {
    _id: instance.progressId,
    playerInstanceId: instance._id,
  };

  return {
    instance: instance as PlayerInstance,
    progress,
  };
}
