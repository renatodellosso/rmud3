import entities, { CreatureId, EntityId } from "lib/gamedata/entities";
import {
  AbilityScore,
  DamageType,
  Targetable,
  WeightedTable,
} from "lib/types/types";
import Ability, { AbilitySource, AbilityWithSource } from "lib/types/Ability";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";
import { EntityDefinition, EntityInstance } from "lib/types/entity";
import { getFromOptionalFunc, savePlayer } from "lib/utils";
import { LocationId } from "lib/gamedata/rawLocations";
import { ContainerInstance } from "./container";
import Inventory, { DirectInventory } from "../Inventory";
import { ItemInstance } from "../item";
import { ItemId } from "lib/gamedata/items";
import { ObjectId } from "bson";
import getPlayerManager from "lib/PlayerManager";
import { PlayerInstance } from "../player";
import StatAndAbilityProvider from "../StatAndAbilityProvider";

export type CreatureDefinition = EntityDefinition & {
  health: number;
  abilityScores: { [score in AbilityScore]: number };
  intrinsicAbilities?: Ability[];
  maxDrops: number;
  lootTable: WeightedTable<ItemId>;
  xpValue: number;
};

export class CreatureInstance extends EntityInstance {
  health: number = undefined as unknown as number;

  canActAt: Date = new Date();
  lastActedAt: Date = new Date();

  /**
   * Maps Entity IDs to the amount of damage they have dealt to this creature.
   */
  damagers: DamagerList = new DamagerList();

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
    let val = this.getDef().abilityScores[score];

    for (const provider of this.getStatAndAbilityProviders()) {
      if (
        provider.provider.getAbilityScores &&
        provider.provider.getAbilityScores[score]
      ) {
        val += getFromOptionalFunc(
          provider.provider.getAbilityScores[score],
          this,
          provider.source
        );
      }
    }

    return val;
  }

  getMaxHealth() {
    let health =
      this.getDef().health +
      5 * this.getAbilityScore(AbilityScore.Constitution);

    health += this.mapStatAndAbilityProviders((provider, source) =>
      getFromOptionalFunc(provider.getMaxHealth, this, source)
    ).reduce((total, val) => total + (val ?? 0), 0);

    return Math.max(health, 1);
  }

  getAbilities() {
    const abilities: AbilityWithSource[] = [];

    abilities.push(
      ...(this.getDef().intrinsicAbilities?.map((ability) => ({
        ability,
        source: this,
      })) ?? [])
    );

    abilities.push(
      ...this.mapStatAndAbilityProviders((provider, source) =>
        getFromOptionalFunc(provider.getAbilities, this, source)?.map(
          (ability) => ({
            ability,
            source,
          })
        )
      ).flat()
    );

    return abilities;
  }

  takeDamage(amount: number, type: DamageType, source: EntityInstance): number {
    amount = Math.min(Math.max(amount, 0), this.health);

    this.damagers.addDamage(source, amount);

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

    this.damagers.distributeXp(
      (entities[this.definitionId] as CreatureDefinition).xpValue
    );

    for (let i = 0; i < this.getDef().maxDrops; i++) {
      const drop = this.getDef().lootTable.roll();

      const item: ItemInstance = {
        definitionId: drop.item,
        amount: drop.amount,
      };

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

  prepForGameState() {
    this.damagers = new DamagerList();
  }

  getStatAndAbilityProviders(): {
    provider: StatAndAbilityProvider;
    source: AbilitySource;
  }[] {
    return [];
  }

  mapStatAndAbilityProviders<T>(
    callback: (
      provider: StatAndAbilityProvider,
      source: AbilitySource
    ) => T | undefined
  ): T[] {
    let arr = [];
    for (const provider of this.getStatAndAbilityProviders()) {
      const val = callback(provider.provider, provider.source);

      if (val !== undefined) {
        arr.push(val);
      }
    }
    return arr;
  }
}

class DamagerList {
  damagers: { [key: string]: { entity: EntityInstance; damage: number } } = {};

  addDamage(entity: EntityInstance, damage: number) {
    const id = entity._id.toString();
    if (!this.damagers[id]) {
      this.damagers[id] = { entity, damage };
    } else {
      this.damagers[id].damage += damage;
    }
  }

  getTotalDamage() {
    return Object.values(this.damagers).reduce(
      (total, { damage }) => total + damage,
      0
    );
  }

  distributeXp(xp: number) {
    console.log(
      `Distributing ${xp} XP among ${
        Object.keys(this.damagers).length
      } damagers`
    );

    let totalDamage = this.getTotalDamage();

    if (totalDamage === 0) {
      return;
    }

    for (const damager of Object.values(this.damagers)) {
      const share = (damager.damage / totalDamage) * xp;

      if (
        "addXp" in damager.entity &&
        typeof damager.entity.addXp === "function"
      ) {
        damager.entity.addXp(share);
      }
    }
  }
}
