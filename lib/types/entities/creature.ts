import entities, { CreatureId, EntityId } from "lib/gamedata/entities";
import { AbilityScore, DamageType, Targetable, WeightedTable } from "lib/types/types";
import Ability, { AbilitySource, AbilityWithSource } from "lib/types/Ability";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";
import { EntityDefinition, EntityInstance } from "lib/types/entity";
import { getFromOptionalFunc } from "lib/utils";
import { LocationId } from "lib/gamedata/rawLocations";
import { ContainerInstance } from "./container";
import Inventory, { DirectInventory } from '../Inventory';
import { ItemInstance } from '../item';
import { ItemId } from "lib/gamedata/items";

export type CreatureDefinition = EntityDefinition & {
  health: number;
  abilityScores: { [score in AbilityScore]: number };
  intrinsicAbilities?: Ability[];
  maxDrops: number;
  lootTable: WeightedTable<ItemId>;
};

export class CreatureInstance extends EntityInstance {
  health: number = undefined as unknown as number;

  canActAt: Date = new Date();
  lastActedAt: Date = new Date();

  constructor(
    definitionId: CreatureId = undefined as any,
    locationId: LocationId = undefined as any
  ) {
    super(definitionId, locationId);

    const definition = this.getDef();
    if (!definition) {
      return;
    }

    this.health = this.getMaxHealth();
  }

  getDef() {
    return entities[this.definitionId] as CreatureDefinition;
  }

  getAbilityScore(score: AbilityScore) {
    return this.getDef().abilityScores[score];
  }

  getMaxHealth() {
    return (
      this.getDef().health + 5 * this.getAbilityScore(AbilityScore.Constitution)
    );
  }

  getAbilities() {
    const abilities: AbilityWithSource[] = [];

    abilities.push(
      ...(this.getDef().intrinsicAbilities?.map((ability) => ({
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

    const io = getIo();
    io.sendMsgToRoom(location.id, `${this.name} has died.`);

    let items: ItemInstance[] = [];

    for (let i = 0; i < this.getDef().maxDrops; i++) {
      const drop = this.getDef().lootTable.roll();

      const item: ItemInstance = {definitionId: drop.item, amount: drop.amount};

      items.push(item);
    }

    const inventory = new DirectInventory(items);

    const corpse = new ContainerInstance(
      "container",
      this.location,
      `${this.name}'s Corpse`,
      inventory
    );
    location.entities.add(corpse);

    io.updateGameStateForRoom(location.id);
  }

  activateAbility(
    ability: Ability,
    targets: Targetable[],
    source: AbilitySource
  ) {
    ability.activate(this, targets, source);

    const location = locations[this.location];

    this.lastActedAt = new Date();
    this.canActAt = new Date();

    this.canActAt.setSeconds(
      this.canActAt.getSeconds() +
        getFromOptionalFunc(ability.getCooldown, this, source)
    );

    getIo().updateGameStateForRoom(location.id);
  }
}
