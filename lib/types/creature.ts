import { ObjectId } from "bson";
import creatures from "../gamedata/creatures";
import locations from "../gamedata/locations";
import { AbilityScore, CannotDirectlyCreateInstanceError } from "./types";
import Ability from "./Ability";

export type CreatureDefinition = {
  name: string;

  health: number;
  abilityScores: { [score in AbilityScore]: number };
  intrinsicAbilities?: Ability[];
};

export class CreatureInstance {
  _id: ObjectId;

  definitionId: keyof typeof creatures;

  name: string;
  location: keyof typeof locations;

  health: number;

  canActAt: Date;

  constructor() {
    this._id = undefined as unknown as ObjectId;
    this.definitionId = undefined as unknown as keyof typeof creatures;
    this.name = undefined as unknown as string;
    this.location = undefined as unknown as keyof typeof locations;

    this.health = undefined as unknown as number;

    this.canActAt = undefined as unknown as Date;
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

  getAbilities() {
    const abilities: Ability[] = [];

    abilities.push(...(creatures[this.definitionId].intrinsicAbilities ?? []));

    return abilities;
  }
}
