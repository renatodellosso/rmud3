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
