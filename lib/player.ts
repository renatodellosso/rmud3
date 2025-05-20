import { ObjectId } from "bson";
import { CreatureInstance } from "./creature";
import Inventory from "./Inventory";
import { AbilityScore, CannotDirectlyCreateInstanceError } from "./utilstypes";
import { ItemInstance } from "./item";

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
}

/**
 * All player data that is not directly related to the player creature.
 */
export type PlayerProgress = {
  _id: ObjectId;

  playerInstanceId: ObjectId;
};
