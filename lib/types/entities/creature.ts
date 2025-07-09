import entities, { CreatureId } from "lib/gamedata/entities";
import { Targetable } from "lib/types/types";
import { LootTable } from "lib/types/LootTable";
import AbilityScore, {
  BONUS_FROM_INTELLIGENCE,
  BONUS_FROM_STRENGTH,
} from "lib/types/AbilityScore";
import Ability, { AbilitySource, AbilityWithSource } from "lib/types/Ability";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";
import { EntityDefinition, EntityInstance } from "lib/types/entity";
import { getFromOptionalFunc } from "lib/utils";
import { LocationId } from "lib/gamedata/rawLocations";
import { ContainerInstance } from "./container";
import { DirectInventory } from "../Inventory";
import { ItemInstance } from "../item";
import StatAndAbilityProvider from "../StatAndAbilityProvider";
import {
  StatusEffectInstance,
  StatusEffectStacking,
  StatusEffectToApply,
} from "../statuseffect";
import statusEffects from "lib/gamedata/statusEffects";
import { DamageWithType } from "../types";
import reforges from "lib/gamedata/Reforges";
import { DamageType } from "../Damage";

export type CreatureDefinition = EntityDefinition & {
  health: number;
  abilityScores: { [score in AbilityScore]: number };
  intrinsicAbilities?: Ability[];
  lootTable: LootTable;
  xpValue: number;
  damageResistances?: { amount: number; type: DamageType | "*" }[];
  onDie?: (creature: CreatureInstance) => void;
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
    damage: DamageWithType[]
  ): { amount: number; type: DamageType }[] {
    const strengthMultiplier =
      1 + BONUS_FROM_STRENGTH * this.getAbilityScore(AbilityScore.Strength);
    for (const d of damage) {
      d.amount *= strengthMultiplier;
    }

    for (const provider of this.getStatAndAbilityProviders()) {
      if (provider.provider.getDamageBonuses) {
        for (const damageBonus of getFromOptionalFunc(
          provider.provider.getDamageBonuses,
          this,
          provider.provider as ItemInstance
        )) {
          let isDamageAdded = false;

          for (const damageEntry of damage) {
            if (
              !isDamageAdded &&
              (damageEntry.type === damageBonus.type ||
                damageBonus.type === "*")
            ) {
              damageEntry.amount += damageBonus.amount;
              isDamageAdded = true;
            }
          }

          if (!isDamageAdded && (damageBonus.type as DamageType)) {
            damage.push({
              amount: damageBonus.amount,
              type: damageBonus.type as DamageType,
            });
          }
        }
      }

      if (provider.provider.getDamageToDeal) {
        damage = provider.provider.getDamageToDeal(
          this,
          provider.source,
          damage
        );
      }
    }

    return damage;
  }

  takeDamage(
    damage: { amount: number; type: DamageType }[],
    source: AbilitySource,
    entitySource: EntityInstance
  ): { amount: number; type: DamageType }[] {
    let newDamage = damage.map((d) => ({ amount: d.amount, type: d.type }));

    let damageResistancePercent: number = 1;

    let damageResistances = (entities[this.definitionId] as CreatureDefinition)
      .damageResistances;

    if (damageResistances) {
      for (const damageResistance of damageResistances) {
        let isDamageResisted = false;
        for (const damageEntry of newDamage) {
          if (!isDamageResisted && damageEntry.type === damageResistance.type) {
            damageEntry.amount = Math.max(
              damageEntry.amount - damageResistance.amount,
              0
            );
            isDamageResisted = true;
          }
        }
      }
    }

    for (let provider of this.getStatAndAbilityProviders()) {
      let providerSource = provider.source;

      if (
        (providerSource as ItemInstance) &&
        (providerSource as ItemInstance).reforge
      ) {
        let reforge = reforges[(providerSource as ItemInstance).reforge!];

        damageResistancePercent = reforge.damageResistancePercent
          ? reforge.damageResistancePercent
          : 1;
      } else {
        damageResistancePercent = 1;
      }

      if (provider.provider.getDamageResistances) {
        for (const damageResistance of getFromOptionalFunc(
          provider.provider.getDamageResistances,
          this,
          provider.provider as ItemInstance
        )) {
          let isDamageResisted = false;
          for (const damageEntry of newDamage) {
            if (
              !isDamageResisted &&
              damageEntry.type === damageResistance.type
            ) {
              damageEntry.amount = Math.max(
                damageEntry.amount -
                  Math.ceil(damageResistance.amount * damageResistancePercent),
                0
              );
              isDamageResisted = true;
            }
          }
        }
      }

      if (provider.provider.getDamageToTake) {
        newDamage = provider.provider.getDamageToTake(
          this,
          provider.source,
          newDamage
        );
      }

      if (provider.provider.getDamageResistances) {
        for (const damageResistance of getFromOptionalFunc(
          provider.provider.getDamageResistances,
          this,
          provider.provider as ItemInstance
        )) {
          let isDamageResisted = false;
          for (const damageEntry of newDamage) {
            if (
              !isDamageResisted &&
              damageResistance.type === "*" &&
              damageEntry.amount > 0
            ) {
              damageEntry.amount = Math.max(
                damageEntry.amount -
                  Math.ceil(damageResistance.amount * damageResistancePercent),
                0
              );
              isDamageResisted = true;
            }
          }
        }
      }
    }

    if (damageResistances) {
      for (const damageResistance of damageResistances) {
        let isDamageResisted = false;
        for (const damageEntry of newDamage) {
          if (
            !isDamageResisted &&
            damageResistance.type === "*" &&
            damageEntry.amount > 0
          ) {
            damageEntry.amount = Math.max(
              damageEntry.amount - damageResistance.amount,
              0
            );
            isDamageResisted = true;
          }
        }
      }
    }

    for (let d of newDamage) {
      d.amount = Math.min(Math.max(d.amount, 0), this.health);

      this.damagers.addDamage(entitySource, d.amount);

      this.health -= d.amount;
    }

    for (const provider of this.getStatAndAbilityProviders()) {
      provider.provider.onTakeDamage?.(this, provider.source, newDamage);
    }

    if (this.health <= 0) {
      this.die();
    }

    return newDamage;
  }

  die() {
    const location = locations[this.location];
    location.entities.delete(this);

    const io = getIo();
    io.sendMsgToRoom(location.id, `${this.name} has died.`);

    this.getDef().onDie?.(this);

    this.damagers.distributeXp(
      (entities[this.definitionId] as CreatureDefinition).xpValue
    );

    let inventory = new DirectInventory();

    if (this.getDef().lootTable) {
      const rolledInventory: ItemInstance[] = this.getDef().lootTable.roll();

      for (const rolledItem of rolledInventory) {
        inventory.add(rolledItem);
      }
    }

    const corpse = new ContainerInstance(
      this.location,
      `${this.name}'s Corpse`,
      inventory,
      true
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

    this.canActAt.setTime(this.canActAt.getTime() + cooldown * 1000);

    getIo().updateGameStateForRoom(location.id);
  }

  /**
   * @param deltaTime in seconds
   */
  tick(deltaTime: number) {
    super.tick(deltaTime);

    // Remove expired status effects
    const newEffects: StatusEffectInstance[] = [];
    const expiredEffects: StatusEffectInstance[] = [];

    for (const effect of this.statusEffects) {
      if (effect.expiresAt.getTime() <= Date.now()) {
        expiredEffects.push(effect);
      } else {
        newEffects.push(effect);
      }
    }

    for (const effect of expiredEffects) {
      const def = statusEffects[effect.definitionId];
      if (def.onExpire) {
        def.onExpire(this, effect);
      }
    }

    this.statusEffects = newEffects;

    for (const provider of this.getStatAndAbilityProviders()) {
      provider.provider.tick?.(this, deltaTime, provider.source);
    }
  }

  /**
   * @param duration in seconds
   */
  addStatusEffect(effect: StatusEffectToApply) {
    let appliedEffect: StatusEffectToApply | undefined = effect;

    for (const provider of this.getStatAndAbilityProviders()) {
      if (provider.provider.getStatusEffectToApply) {
        appliedEffect = provider.provider.getStatusEffectToApply(
          this,
          appliedEffect
        );

        if (!appliedEffect) {
          return; // Effect was not applied
        }
      }
    }

    const existing = this.statusEffects.find(
      (e) => e.definitionId === effect.id
    );

    const def = statusEffects[effect.id];

    let newStrength: number;
    let newDuration: number;

    for (let provider of this.getStatAndAbilityProviders()) {
      if (provider.provider.getStatusEffectDuration) {
        effect.duration = provider.provider.getStatusEffectDuration(
          this,
          effect
        );
      }
    }

    if (def.stacking === StatusEffectStacking.Separate || !existing) {
      this.statusEffects.push({
        definitionId: effect.id,
        strength: effect.strength,
        expiresAt: new Date(Date.now() + effect.duration * 1000),
      });
      return;
    }

    switch (def.stacking) {
      case StatusEffectStacking.AddStrengthMaxDuration:
        newStrength = existing.strength + effect.strength;
        newDuration = Math.max(
          existing.expiresAt.getTime() - Date.now(),
          effect.duration * 1000
        );
        existing.strength = newStrength;
        existing.expiresAt.setTime(Date.now() + newDuration);
        break;
      case StatusEffectStacking.AddDurationMaxStrength:
        newStrength = Math.max(existing.strength, effect.strength);
        newDuration =
          existing.expiresAt.getTime() - Date.now() + effect.duration * 1000;
        existing.strength = newStrength;
        existing.expiresAt.setTime(Date.now() + newDuration);
        break;
      case StatusEffectStacking.AddStrengthAndDuration:
        newStrength = existing.strength + effect.strength;
        newDuration =
          existing.expiresAt.getTime() - Date.now() + effect.duration * 1000;
        existing.strength = newStrength;
        existing.expiresAt.setTime(Date.now() + newDuration);
        break;
      case StatusEffectStacking.MaxStrength:
        newStrength = Math.max(existing.strength, effect.strength);
        existing.strength = newStrength;
        // Keep the existing expiration time
        break;
      case StatusEffectStacking.MaxDuration:
        newDuration = Math.max(
          existing.expiresAt.getTime() - Date.now(),
          effect.duration * 1000
        );
        existing.expiresAt.setTime(Date.now() + newDuration);
        // Keep the existing strength
        break;
    }

    def.onApply?.(this, existing);
  }

  /**
   * @param health
   * @returns actual health gained
   */
  addHealth(health: number) {
    for (const provider of this.getStatAndAbilityProviders()) {
      if (provider.provider.getAmountToHeal) {
        health = provider.provider.getAmountToHeal(
          this,
          provider.source,
          health
        );
      }
    }

    const initialHealth = this.health;
    this.health += health;

    if (this.health > this.getMaxHealth()) this.health = this.getMaxHealth();

    this.mapStatAndAbilityProviders((provider, source) =>
      provider.onHeal?.(this, source, health)
    );

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

  scaleAbility(base: number) {
    return (
      base *
      (1 +
        BONUS_FROM_INTELLIGENCE *
          this.getAbilityScore(AbilityScore.Intelligence))
    );
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
    // console.log(
    //   `Distributing ${xp} XP among ${
    //     Object.keys(this.damagers).length
    //   } damagers: ${Object.keys(this.damagers).join(
    //     ", "
    //   )}. Total damage: ${this.getTotalDamage()}`
    // );

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
