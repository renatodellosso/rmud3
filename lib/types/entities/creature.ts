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
import StatAndAbilityProvider from "../StatAndAbilityProvider";
import { StatusEffectInstance, StatusEffectToApply } from "../statuseffect";
import statusEffects, { StatusEffectId } from "lib/gamedata/statusEffects";
import { DungeonLocation, FloorInstance } from "lib/dungeongeneration/types";

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

  statusEffects: StatusEffectInstance[] = [];

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
    let health = this.getBaseHealth() + this.getHealthBonusFromConstitution();

    health += this.mapStatAndAbilityProviders((provider, source) =>
      getFromOptionalFunc(provider.getMaxHealth, this, source)
    ).reduce((total, val) => total + (val ?? 0), 0);

    return Math.max(health, 1);
  }

  getBaseHealth() {
    return this.getDef().health;
  }

  getHealthBonusFromConstitution() {
    return 5 * this.getAbilityScore(AbilityScore.Constitution);
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

  getDamageToDeal(
    amount: number,
    type: DamageType
  ): { amount: number; type: DamageType }[] {
    amount += this.getAbilityScore(AbilityScore.Strength);
    let damage = [{ amount, type }];

    for (const provider of this.getStatAndAbilityProviders()) {
      if (!provider.provider.getDamageToDeal) {
        continue;
      }

      damage = provider.provider.getDamageToDeal(this, provider.source, damage);
    }

    return damage;
  }

  takeDamage(
    damage: { amount: number; type: DamageType }[],
    source: EntityInstance
  ): { amount: number; type: DamageType }[] {
    for (const provider of this.getStatAndAbilityProviders()) {
      if (!provider.provider.getDamageToTake) {
        continue;
      }

      damage = provider.provider.getDamageToTake(this, provider.source, damage);
    }

    for (let d of damage) {
      d.amount = Math.min(Math.max(d.amount, 0), this.health);

      this.damagers.addDamage(source, d.amount);

      this.health -= d.amount;

      if (this.health <= 0) {
        this.die();
      }
    }

    return damage;
  }

  die() {
    const location = locations[this.location];
    location.entities.delete(this);

    const io = getIo();
    io.sendMsgToRoom(location.id, `${this.name} has died.`);

    this.damagers.distributeXp(
      (entities[this.definitionId] as CreatureDefinition).xpValue
    );

    let inventory = new DirectInventory();

    for (let i = 0; i < this.getDef().maxDrops; i++) {
      const drop = this.getDef().lootTable.roll();

      const item: ItemInstance = {
        definitionId: drop.item,
        amount: drop.amount,
      };

      inventory.add(item);
    }

    const corpse = new ContainerInstance(
      "container",
      this.location,
      `${this.name}'s Corpse`,
      inventory
    );
    location.entities.add(corpse);

    io.updateGameStateForRoom(location.id);

    return corpse;
  }

  activateAbility(
    ability: Ability,
    targets: Targetable[],
    source: AbilitySource
  ) {
    const wasAbilitySuccessful: boolean = ability.activate(
      this,
      targets,
      source
    );

    if (!wasAbilitySuccessful) return;

    const location = locations[this.location];

    this.lastActedAt = new Date();
    this.canActAt = new Date();

    let cooldown = getFromOptionalFunc(ability.getCooldown, this, source);
    for (const provider of this.getStatAndAbilityProviders()) {
      if (provider.provider.getCooldown) {
        cooldown = provider.provider.getCooldown(
          this,
          provider.source,
          ability,
          cooldown
        );
      }
    }

    this.canActAt.setSeconds(this.canActAt.getSeconds() + cooldown);

    getIo().updateGameStateForRoom(location.id);
  }

  /**
   * @param deltaTime in seconds
   */
  tick(deltaTime: number) {
    super.tick(deltaTime);

    // Remove expired status effects
    this.statusEffects = this.statusEffects.filter(
      (effect) => effect.expiresAt > new Date()
    );

    for (const provider of this.getStatAndAbilityProviders()) {
      provider.provider.tick?.(this, deltaTime, provider.source);
    }
  }

  /**
   * @param duration in seconds
   */
  addStatusEffect(effect: StatusEffectToApply) {
    const { id, strength, duration } = effect;

    const existing = this.statusEffects.find(
      (effect) => effect.definitionId === id
    );

    if (existing) {
      // If the effect already exists, extend its duration
      existing.expiresAt.setSeconds(existing.expiresAt.getSeconds() + duration);
    } else {
      // Otherwise, create a new effect
      this.statusEffects.push({
        definitionId: id,
        strength: strength,
        expiresAt: new Date(Date.now() + duration * 1000),
      });
    }
  }

  /**
   * @param health
   * @returns actual health gained
   */
  addHealth(health: number) {
    const initialHealth = this.health;
    this.health += health;

    if (this.health > this.getMaxHealth()) this.health = this.getMaxHealth();

    return this.health - initialHealth;
  }

  prepForGameState() {
    this.damagers = new DamagerList();
  }

  getStatAndAbilityProviders(): {
    provider: StatAndAbilityProvider;
    source: AbilitySource;
  }[] {
    return this.statusEffects.map((effect) => ({
      provider: statusEffects[effect.definitionId] as StatAndAbilityProvider,
      source: effect,
    }));
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
