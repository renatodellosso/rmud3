import { ObjectId } from "bson";
import { CreatureInstance } from "../entities/creature";
import Inventory, { DirectInventory } from "../Inventory";
import {
  AbilityScore,
  CannotDirectlyCreateInstanceError,
  DamageType,
  OmitType,
  PlayerSave,
} from "../types";
import {
  ConsumableDefinition,
  EquipmentDefinition,
  ItemInstance,
  ItemTag,
} from "../item";
import Ability, { AbilitySource, AbilityWithSource } from "../Ability";
import items from "lib/gamedata/items";
import { EquipmentHotbar } from "../Hotbar";
import {
  getFromOptionalFunc,
  restoreFieldsAndMethods,
  savePlayer,
} from "lib/utils";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";
import { LocationId } from "lib/gamedata/rawLocations";
import { EntityInstance } from "../entity";
import XpForNextLevel from "lib/gamedata/XpForNextLevel";
import StatAndAbilityProvider from "../StatAndAbilityProvider";

export class PlayerInstance extends CreatureInstance {
  progressId: ObjectId = undefined as unknown as ObjectId;

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

  tick(deltaTime: number): void {
    // Update game state if status effects have changed
    const originalStatusEffectCount = this.statusEffects.length;
    super.tick(deltaTime);
    if (this.statusEffects.length != originalStatusEffectCount) {
      getIo().updateGameState(this._id.toString());
    }
  }

  getMaxHealth(): number {
    let val = super.getMaxHealth();

    for (const equipment of this.equipment.items) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.getMaxHealth) continue;

      val += getFromOptionalFunc(def.getMaxHealth, this, equipment);
    }

    return val;
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

  takeDamage(amount: number, type: DamageType, source: EntityInstance): number {
    const damageTaken = super.takeDamage(amount, type, source);

    if (this.health > 0 && damageTaken > 0)
      getIo().emit(this._id.toString(), "tookDamage", damageTaken);

    return damageTaken;
  }

  die(): void {
    super.die();

    respawn(this);
  }

  move(newLocationId: LocationId): void {
    super.move(newLocationId);

    getIo().clearInteractions(this._id.toString());
  }

  addXp(amount: number): void {
    this.xp += amount;

    const io = getIo();
    io.sendMsgToPlayer(this._id.toString(), `You gained ${amount} XP!`);

    if (this.xp >= XpForNextLevel[this.level]) this.levelUp();

    io.updateGameState(this._id.toString());
    savePlayer(this);
  }

  levelUp() {
    this.level++;
    this.abilityScoreIncreases++;

    getIo().sendMsgToPlayer(
      this._id.toString(),
      `You leveled up! You are now level ${this.level}.`
    );
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
    return super.getStatAndAbilityProviders().concat(
      this.equipment.items.map((item) => ({
        provider: items[item.definitionId] as StatAndAbilityProvider,
        source: item,
      }))
    );
  }
}

/**
 * All player data that is not directly related to the player creature.
 */
export type PlayerProgress = {
  _id: ObjectId;

  playerInstanceId: ObjectId;
};

export function getDefaultPlayerAndProgress(): PlayerSave {
  const instance: PlayerInstance = {
    _id: new ObjectId(),
    name: "Player",
    saveName: "save",
    location: "docks",
    progressId: new ObjectId(),
    definitionId: "player",
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

  instance.equipment.equip(instance, {
    definitionId: "rustySword",
    amount: 1,
  });

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
    player.health = player.getMaxHealth();
    locations["docks"].enter(player);
    io.updateGameState(player._id.toString());
  }, 1250);
}
