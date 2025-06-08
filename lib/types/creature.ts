import { ObjectId } from "bson";
import creatures from "../gamedata/creatures";
import { AbilityScore, DamageType } from "./types";
import Ability, { AbilitySource, AbilityWithSource } from "./Ability";
import { LocationId } from "./Location";
import locations from "lib/locations";

export type CreatureDefinition = {
  name: string;

  health: number;
  abilityScores: { [score in AbilityScore]: number };
  intrinsicAbilities?: Ability[];
  /**
   * @param deltaTime in seconds
   */
  tick?: (creature: CreatureInstance, deltaTime: number) => void;
};

export class CreatureInstance {
  _id: ObjectId = new ObjectId();

  definitionId: keyof typeof creatures =
    undefined as unknown as keyof typeof creatures;

  name: string = undefined as unknown as string;
  location: LocationId = undefined as unknown as LocationId;

  health: number = undefined as unknown as number;

  canActAt: Date = new Date();
  lastActedAt: Date = new Date();

  constructor(
    definitionId: keyof typeof creatures = undefined as any,
    locationId: LocationId = undefined as any
  ) {
    this.definitionId = definitionId;
    this.location = locationId;

    const definition = creatures[definitionId];
    if (!definition) {
      return;
    }

    this.name = definition.name;
    this.health = definition.health;
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
    const abilities: AbilityWithSource[] = [];

    abilities.push(
      ...(creatures[this.definitionId].intrinsicAbilities?.map((ability) => ({
        ability,
        source: this,
      })) ?? [])
    );

    return abilities;
  }

  takeDamage(amount: number, type: DamageType): number {
    amount = Math.min(Math.max(amount, 0), this.health);

    this.health -= amount;

    return amount;
  }

  die(instance: CreatureInstance) {
    const location = locations[this.location];

    location.creatures.delete(this);
  }
}
