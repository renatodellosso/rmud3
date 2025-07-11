import { ObjectId } from "bson";
import { CreatureInstance } from "../entities/creature";
import Inventory, { DirectInventory, MultipleInventory } from "../Inventory";
import {
  CannotDirectlyCreateInstanceError,
  OmitType,
  PlayerSave,
  Targetable,
} from "../types";
import AbilityScore from "../AbilityScore";
import Difficulty, {
  difficultyOptions,
  InventoryHandlingOnDeath,
} from "../Difficulty";
import {
  ConsumableDefinition,
  EquipmentDefinition,
  ItemInstance,
} from "../item";
import Ability, { AbilitySource, AbilityWithSource } from "../Ability";
import items from "lib/gamedata/items";
import { ItemTag } from "../itemenums";
import { EquipmentHotbar } from "../Hotbar";
import {
  getFromOptionalFunc,
  isInTown,
  restoreFieldsAndMethods,
  savePlayer,
} from "lib/utils";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";
import { LocationId } from "lib/gamedata/rawLocations";
import { EntityInstance } from "../entity";
import { getXpForNextLevel } from "lib/gamedata/levelling";
import StatAndAbilityProvider from "../StatAndAbilityProvider";
import Vault from "../Vault";
import Guild from "../Guild";
import reforges from "lib/gamedata/Reforges";
import { DamageType } from "../Damage";

export class PlayerInstance extends CreatureInstance {
  progressId: ObjectId = undefined as unknown as ObjectId;
  difficulty: Difficulty = Difficulty.Normal;

  definitionId: "player" = "player";

  saveName: string = undefined as unknown as string;

  abilityScores: { [score in AbilityScore]: number } = {
    [AbilityScore.Strength]: 0,
    [AbilityScore.Constitution]: 0,
    [AbilityScore.Intelligence]: 0,
  };

  level: number = 0;
  xp: number = 0;
  abilityScoreIncreases: number = 0;

  inventory: DirectInventory = new DirectInventory();
  equipment: EquipmentHotbar = new EquipmentHotbar();

  vault: Vault = new Vault();

  guildId: ObjectId | undefined = undefined;

  tick(deltaTime: number): void {
    // Update game state if status effects have changed
    const originalStatusEffectCount = this.statusEffects.length;
    super.tick(deltaTime);
    getIo().updateGameState(this._id.toString());
  }

  getMaxHealth(): number {
    let val = super.getMaxHealth();

    val += this.level;

    for (const equipment of this.equipment.items) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (def.getMaxHealth)
        val += getFromOptionalFunc(def.getMaxHealth, this, equipment);

      if (equipment.reforge && reforges[equipment.reforge].getMaxHealth)
        val += getFromOptionalFunc(
          reforges[equipment.reforge].getMaxHealth,
          this,
          equipment
        );
    }

    return Math.max(val, 1);
  }

  getBaseHealth(): number {
    return (
      difficultyOptions[this.difficulty].baseHealthMultiplier *
      super.getBaseHealth()
    );
  }

  getHealthBonusFromConstitution(): number {
    const fromDifficulty =
      difficultyOptions[this.difficulty].healthBonusFromConstitution;

    if (!fromDifficulty) return super.getHealthBonusFromConstitution();
    return fromDifficulty * this.getAbilityScore(AbilityScore.Constitution);
  }

  getAbilityScore(score: AbilityScore) {
    let val = this.abilityScores[score] + super.getAbilityScore(score);

    return val;
  }

  getConsumables(): ItemInstance[] {
    return this.inventory.items.filter((item) =>
      items[item.definitionId].tags.includes(ItemTag.Consumable)
    );
  }

  getAbilities(): AbilityWithSource[] {
    const abilities = super.getAbilities();

    for (const equipment of this.getConsumables()) {
      const def = items[equipment.definitionId] as ConsumableDefinition;
      if (!def.getAbilities) continue;

      abilities.push(
        ...getFromOptionalFunc(def.getAbilities, this, equipment).map(
          (ability) => ({
            ability,
            source: equipment,
          })
        )
      );
    }
    return abilities;
  }

  takeDamage(
    damage: { amount: number; type: DamageType }[],
    source: AbilitySource,
    entitySource: EntityInstance
  ): { amount: number; type: DamageType }[] {
    const damageTaken = super.takeDamage(damage, source, entitySource);

    for (const d of damageTaken) {
      if (this.health > 0 && d.amount > 0)
        getIo().emit(this._id.toString(), "tookDamage", damageTaken);
    }

    return damageTaken;
  }

  die() {
    const corpse = super.die();

    switch (difficultyOptions[this.difficulty].inventoryHandlingOnDeath) {
      case InventoryHandlingOnDeath.KeepItems:
        break;
      case InventoryHandlingOnDeath.DropItems:
        this.equipment.items.forEach((item) => this.inventory.add(item, true));
        this.inventory.items.forEach((item) =>
          corpse.inventory.add(item, true)
        );
      // Pass through to DestroyItems
      case InventoryHandlingOnDeath.DestroyItems:
        this.inventory = new DirectInventory();
        this.equipment = new EquipmentHotbar();
        break;
    }

    if (locations[this.location].entities.has(this))
      throw new Error("Player not removed from location entities on death.");

    const io = getIo();
    io.leaveRoom(this.location, this._id.toString());
    io.clearInteractions(this._id.toString());

    respawn(this);

    return corpse;
  }

  move(newLocationId: LocationId): void {
    super.move(newLocationId);

    getIo().clearInteractions(this._id.toString());
  }

  addXp(amount: number): void {
    for (const provider of this.getStatAndAbilityProviders()) {
      if (provider.provider.getXpToAdd) {
        amount = provider.provider.getXpToAdd(this, provider.source, amount);
      }
    }

    this.xp += amount;

    const io = getIo();
    io.sendMsgToPlayer(
      this._id.toString(),
      `You gained ${amount.toFixed()} XP!`
    );

    if (this.xp >= getXpForNextLevel(this.level)) this.levelUp();

    io.updateGameState(this._id.toString());
    savePlayer(this);
  }

  levelUp() {
    const oldEquipmentLimit = this.equipment.getCapacity(this);

    this.level++;
    this.abilityScoreIncreases++;

    const io = getIo();
    io.sendMsgToPlayer(
      this._id.toString(),
      `You leveled up! You are now level ${this.level}.`
    );

    const newEquipmentLimit = this.equipment.getCapacity(this);
    if (newEquipmentLimit > oldEquipmentLimit) {
      io.sendMsgToPlayer(
        this._id.toString(),
        `You can now equip ${
          newEquipmentLimit - oldEquipmentLimit
        } more items, for a total of ${newEquipmentLimit}.`
      );
    }
  }

  recalculateStats() {
    this.recalculateMaxWeight();
    this.vault.recalculateVaultSize();
  }

  recalculateMaxWeight() {
    this.inventory.maxWeight = 100;

    this.inventory.maxWeight +=
      this.getAbilityScore(AbilityScore.Strength) * 10;

    for (const provider of this.getStatAndAbilityProviders()) {
      if (!provider.provider.getCarryingCapacity) continue;

      this.inventory.maxWeight += getFromOptionalFunc(
        provider.provider.getCarryingCapacity,
        this,
        provider.source
      );
    }
  }

  getStatAndAbilityProviders(): {
    provider: StatAndAbilityProvider;
    source: AbilitySource;
  }[] {
    let statAndAbilityProviders: {
      provider: StatAndAbilityProvider;
      source: AbilitySource;
    }[] = super.getStatAndAbilityProviders().concat(
      this.equipment.items.map((item) => ({
        provider: items[item.definitionId] as StatAndAbilityProvider,
        source: item,
      }))
    );

    for (let item of this.equipment.items) {
      if (item.reforge) {
        statAndAbilityProviders.push({
          provider: reforges[item.reforge] as StatAndAbilityProvider,
          source: item,
        });
      }
    }

    return statAndAbilityProviders;
  }

  activateAbility(
    ability: Ability,
    targets: Targetable[],
    source: AbilitySource
  ) {
    let cooldownPercent: number = 1;

    if ((source as ItemInstance) && (source as ItemInstance).reforge) {
      let reforge = reforges[(source as ItemInstance).reforge!];

      cooldownPercent = reforge.cooldownPercent ? reforge.cooldownPercent : 1;
    }

    const wasAbilitySuccessful: boolean = ability.activate(
      this,
      targets,
      source
    );

    if (!wasAbilitySuccessful) return;

    const location = locations[this.location];

    let cooldown =
      getFromOptionalFunc(ability.getCooldown, this, source) * cooldownPercent;
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

    if ("health" in source) {
      this.lastActedAt = new Date();

      this.canActAt.setTime(this.lastActedAt.getTime() + cooldown * 1000);
    }

    if (
      "definitionId" in source &&
      "amount" in source
    ) {
      if (items[source.definitionId].tags.includes(ItemTag.Consumable)) {
        this.inventory.remove(new ItemInstance(source.definitionId, 1));
      }

      source.lastActedAt = new Date();

      source.canActAt.setTime(source.lastActedAt.getTime() + cooldown * 1000);
    }

    getIo().updateGameStateForRoom(location.id);
  }

  getGuild(): Promise<Guild | undefined> {
    return (
      (this.guildId && Guild.fromId(this.guildId)) || Promise.resolve(undefined)
    );
  }

  getCraftingInventory(): Inventory {
    return isInTown(this.location)
      ? new MultipleInventory([this.inventory, this.vault.inventory])
      : this.inventory;
  }
}

/**
 * All player data that is not directly related to the player creature.
 */
export type PlayerProgress = {
  _id: ObjectId;

  playerInstanceId: ObjectId;
};

export function getDefaultPlayerAndProgress(
  difficulty: Difficulty
): PlayerSave {
  const instance: PlayerInstance = {
    _id: new ObjectId(),
    name: "Player",
    saveName: "save",
    location: "docks",
    progressId: new ObjectId(),
    definitionId: "player",
    difficulty,
    abilityScores: {
      Strength: 0,
      Constitution: 0,
      Intelligence: 0,
    },
    xp: 0,
    inventory: new DirectInventory(),
    equipment: new EquipmentHotbar(),
    health: 0,
    canActAt: new Date(),
    lastActedAt: new Date(),
  } as OmitType<PlayerInstance, Function> as PlayerInstance;

  restoreFieldsAndMethods(instance, new PlayerInstance());

  instance.health = instance.getMaxHealth();

  instance.equipment.equip(instance, new ItemInstance("rustySword", 1));

  const progress: PlayerProgress = {
    _id: instance.progressId,
    playerInstanceId: instance._id,
  };

  return {
    instance: instance as PlayerInstance,
    progress,
  };
}

function respawn(player: PlayerInstance) {
  const io = getIo();

  io.emit(player._id.toString(), "died");

  setTimeout(() => {
    io.sendMsgToPlayer(player._id.toString(), "You died...");

    player.statusEffects = [];
    player.health = player.getMaxHealth();

    locations["docks"].enter(player);
    io.updateGameState(player._id.toString());
  }, 1250);
}
