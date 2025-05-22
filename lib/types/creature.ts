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
  _id: ObjectId = new ObjectId();

  definitionId: keyof typeof creatures =
    undefined as unknown as keyof typeof creatures;

  name: string = undefined as unknown as string;
  location: keyof typeof locations =
    undefined as unknown as keyof typeof locations;

  health: number = undefined as unknown as number;

  canActAt: Date = new Date();

  constructor() {}

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
