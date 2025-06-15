import { ObjectId } from "bson";
import entities from "../gamedata/entities";
import { AbilityScore, DamageType, Targetable } from "./types";
import Ability, { AbilitySource, AbilityWithSource } from "./Ability";
import { LocationId } from "./Location";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";
import { EntityDefinition, EntityInstance } from "./entity";
import { getFromOptionalFunc } from "lib/utils";

export type CreatureDefinition = EntityDefinition & {
  health: number;
  abilityScores: { [score in AbilityScore]: number };
  intrinsicAbilities?: Ability[];
};

export class CreatureInstance extends EntityInstance {
  health: number = undefined as unknown as number;

  canActAt: Date = new Date();
  lastActedAt: Date = new Date();

  constructor(
    definitionId: keyof typeof entities = undefined as any,
    locationId: LocationId = undefined as any
  ) {
    super(definitionId, locationId);

    const definition = entities[definitionId];
    if (!definition) {
      return;
    }

    this.health = definition.health;
  }

  getAbilityScore(score: AbilityScore) {
    return entities[this.definitionId].abilityScores[score];
  }

  getMaxHealth() {
    return (
      entities[this.definitionId].health +
      5 * this.getAbilityScore(AbilityScore.Constitution)
    );
  }

  getAbilities() {
    const abilities: AbilityWithSource[] = [];

    abilities.push(
      ...(entities[this.definitionId].intrinsicAbilities?.map((ability) => ({
        ability,
        source: this,
      })) ?? [])
    );

    return abilities;
  }

  takeDamage(amount: number, type: DamageType): number {
    amount = Math.min(Math.max(amount, 0), this.health);

    this.health -= amount;

    if (this.health <= 0) {
      this.die();
    }

    return amount;
  }

  die() {
    const location = locations[this.location];
    location.entities.delete(this);

    getIo().sendMsgToRoom(location.id, `${this.name} has died.`);
  }

  activateAbility(
    ability: Ability,
    targets: Targetable[],
    source: AbilitySource
  ) {
    const msg = ability.activate(this, targets, source);

    const location = locations[this.location];

    this.lastActedAt = new Date();
    this.canActAt = new Date();

    this.canActAt.setSeconds(
      this.canActAt.getSeconds() +
        getFromOptionalFunc(ability.getCooldown, this, source)
    );

    getIo().sendMsgToRoom(location.id, msg);
    getIo().updateGameStateForRoom(location.id);
  }
}
