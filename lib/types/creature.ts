import { ObjectId } from "bson";
import creatures from "../gamedata/creatures";
import { AbilityScore } from "./types";
import Ability, { AbilitySource } from "./Ability";
import { LocationId } from "./Location";
import locations from "lib/locations";

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
  location: LocationId = undefined as unknown as LocationId;

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
    const abilities: { ability: Ability; source: AbilitySource }[] = [];

    abilities.push(
      ...(creatures[this.definitionId].intrinsicAbilities?.map((ability) => ({
        ability,
        source: this,
      })) ?? [])
    );

    return abilities;
  }
}
