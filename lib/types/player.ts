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

  getAbilityScore(score: AbilityScore) {
    return this.abilityScores[score] + super.getAbilityScore(score);
  }

  getAbilities(): Ability[] {
    const abilities = super.getAbilities();

    for (const equipment of this.equipment) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (def.abilities) {
        abilities.push(...def.abilities);
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
