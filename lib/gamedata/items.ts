import {
  ConsumableDefinition,
  EquipmentDefinition,
  EquipmentSlot,
  ItemDefinition,
  ItemTag,
} from "lib/types/item";
import * as Abilities from "lib/gamedata/Abilities";
import { DamageType } from "lib/types/types";

export type ItemId =
  | "test"
  | "test2"
  | "rmud3ForDummies"
  | "bone"
  | "skull"
  | "eyeball"
  | "equipment1"
  | "equipment2"
  | "chestplate1"
  | "consumable1"
  | "rustySword"
  | "money";

const items = Object.freeze({
  test: {
    name: "Test Item",
    tags: [],
    description: "This is a test item.",
    getWeight: 1,
    getSellValue: 10,
  },
  test2: {
    name: "Test Item 2",
    tags: [],
    description: "This is another test item.",
    getWeight: 2,
    getSellValue: 20,
  },
  rmud3ForDummies: {
    name: "RMUD3 For Dummies",
    tags: [],
    description: "...",
    getWeight: 2.5,
    getSellValue: 5,
  },
  bone: {
    name: "Bone",
    tags: [],
    description: "TODO: add a witty description.",
    getWeight: 0.5,
    getSellValue: 1,
  },
  skull: {
    name: "Skull",
    tags: [],
    description: "TODO: add a witty description.",
    getWeight: 1,
    getSellValue: 2,
  },
  eyeball: {
    name: "Eyeball",
    tags: [],
    description: "A squishy eyeball that fell from it's socket",
    getWeight: 0.2,
    getSellValue: 1,
  },
  equipment1: {
    name: "Test Equipment",
    tags: [ItemTag.Equipment],
    description: "This is a test equipment.",
    getWeight: 1,
    getSellValue: 15,
  } satisfies EquipmentDefinition,
  equipment2: {
    name: "Test Equipment 2",
    tags: [ItemTag.Equipment],
    description: "This is another test equipment.",
    getWeight: 2,
    getSellValue: 25,
  } satisfies EquipmentDefinition,
  chestplate1: {
    name: "Test Chestplate",
    tags: [ItemTag.Equipment],
    description: "This is a test chestplate.",
    getWeight: 1,
    slot: EquipmentSlot.Chest,
    getSellValue: 30,
  } satisfies EquipmentDefinition,
  consumable1: {
    name: "Test Consumable",
    tags: [ItemTag.Consumable],
    description: "This is a test consumable.",
    getWeight: 1,
    getSellValue: 10,
  } satisfies ConsumableDefinition,
  rustySword: {
    name: "Rusty Sword",
    tags: [ItemTag.Equipment],
    description: "A rusty old sword, not very effective.",
    getWeight: 3,
    getSellValue: 5,
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Rusty Slash",
        "A basic slash attack with the rusty sword.",
        1,
        5,
        DamageType.Slashing
      ),
    ],
  } satisfies EquipmentDefinition,
  money: {
    name: "Silver Coin",
    tags: [],
    description: "A small silver coin.",
    getWeight: 0,
    getSellValue: 1,
  },
} as Record<ItemId, ItemDefinition>);

export default items;
