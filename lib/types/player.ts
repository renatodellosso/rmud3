import { ObjectId } from "bson";
import { CreatureInstance } from "./creature";
import Inventory from "./Inventory";
import { AbilityScore, CannotDirectlyCreateInstanceError } from "./types";
import { EquipmentDefinition, ItemInstance, ItemTag } from "./item";
import Ability from "./Ability";
import items from "lib/gamedata/items";

export class PlayerInstance extends CreatureInstance {
  progressId: ObjectId;

  inventory: Inventory;

  definitionId: "player";

  abilityScores: { [score in AbilityScore]: number };

  equipment: ItemInstance[];

  constructor() {
    throw new CannotDirectlyCreateInstanceError(PlayerInstance.name);
    super();
  }

  getMaxHealth(): number {
    let val = super.getMaxHealth();

    for (const equipment of this.equipment) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.getMaxHealth) continue;

      if (typeof def.getMaxHealth === "function") {
        val += def.getMaxHealth(this, equipment);
      } else {
        val += def.getMaxHealth;
      }
    }

    return val;
  }

  getAbilityScore(score: AbilityScore) {
    let val = this.abilityScores[score] + super.getAbilityScore(score);

    for (const equipment of this.equipment) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (!def.abilityScores || !def.abilityScores[score]) continue;

      if (typeof def.abilityScores[score] === "function") {
        val += def.abilityScores[score](this, equipment);
      } else {
        val += def.abilityScores[score];
      }
    }

    return val;
  }

  getAbilities(): Ability[] {
    const abilities = super.getAbilities();

    for (const equipment of this.equipment) {
      const def = items[equipment.definitionId] as EquipmentDefinition;
      if (Array.isArray(def.getAbilities)) {
        abilities.push(...def.getAbilities);
      } else if (typeof def.getAbilities === "function") {
        abilities.push(...def.getAbilities(this, equipment));
      }
    }
    return abilities;
  }

  getMaxEquipment(): number {
    return 3;
  }

  canEquip(item: ItemInstance): boolean {
    if (this.equipment.includes(item)) return false;

    if (!items[item.definitionId].tags.includes(ItemTag.Equipment))
      return false;
    if (this.equipment.length >= this.getMaxEquipment()) return false;

    if ((items[item.definitionId] as EquipmentDefinition).slot) {
      const sameSlot = this.equipment.find(
        (i) =>
          (items[i.definitionId] as EquipmentDefinition).slot &&
          (items[i.definitionId] as EquipmentDefinition).slot ===
            (items[item.definitionId] as EquipmentDefinition).slot
      );

      if (sameSlot) return false;
    }

    const def = items[item.definitionId] as EquipmentDefinition;
    if (def.canEquip && typeof def.canEquip === "function") {
      return def.canEquip(this);
    }

    return true;
  }

  /**
   * @returns whether the item was successfully equipped
   */
  equip(item: ItemInstance): boolean {
    if (!this.canEquip(item)) return false;

    this.equipment.push(item);
    return true;
  }

  /**
   * @param item The item to unequip. Checks equality by reference.
   * @returns whether the item was successfully unequipped
   */
  unequip(item: ItemInstance): boolean {
    const index = this.equipment.findIndex((i) => i === item);

    if (index === -1) return false;

    this.equipment.splice(index, 1);
    return true;
  }
}

/**
 * All player data that is not directly related to the player creature.
 */
export type PlayerProgress = {
  _id: ObjectId;

  playerInstanceId: ObjectId;
};
