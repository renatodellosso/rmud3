import { ObjectId } from "bson";
import { CreatureInstance } from "./creature";
import Inventory from "./Inventory";
import { AbilityScore, CannotDirectlyCreateInstanceError } from "./utilstypes";
import { EquipmentDefinition, ItemInstance } from "./item";
import Ability from "./Ability";
import items from "lib/gamedata/items";

export class PlayerInstance extends CreatureInstance {
  progressId: ObjectId;

  inventory: Inventory;

  definitionId: "player";

  abilityScores: { [score in AbilityScore]: number };

  equipment: ItemInstance[];

  constructor() {
    throw new CannotDirectlyCreateInstanceError(PlayerInstance.name);
    super();
  }

  getMaxHealth(): number {
    let val = super.getMaxHealth();

    for (const equipment of this.equipment) {
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

    for (const equipment of this.equipment) {
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

    for (const equipment of this.equipment) {
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
