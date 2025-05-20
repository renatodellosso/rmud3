import { ObjectId } from "bson";
import creatures from "./gamedata/creatures";
import locations from "./gamedata/locations";
import { AbilityScore, CannotDirectlyCreateInstanceError } from "./utilstypes";

export type CreatureDefinition = {
  name: string;

  health: number;

  abilityScores: { [score in AbilityScore]: number };
};

export class CreatureInstance {
  _id: ObjectId;

  definitionId: keyof typeof creatures;

  name: string;
  location: keyof typeof locations;

  health: number;

  canActAt: Date;

  constructor() {
    throw new CannotDirectlyCreateInstanceError(CreatureInstance.name);
  }

  getAbilityScore(score: AbilityScore) {
    return creatures[this.definitionId].abilityScores[score];
  }

  getMaxHealth() {
    return (
      creatures[this.definitionId].health +
      5 * this.getAbilityScore(AbilityScore.Constitution)
    );
  }
}
