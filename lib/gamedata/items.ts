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
  | "rustySword";

const items = Object.freeze({
  test: {
    name: "Test Item",
    tags: [],
    description: "This is a test item.",
    weight: 1,
  },
  test2: {
    name: "Test Item 2",
    tags: [],
    description: "This is another test item.",
    weight: 2,
  },
  rmud3ForDummies: {
    name: "RMUD3 For Dummies",
    tags: [],
    description: "...",
    weight: 2.5,
  },
  bone: {
    name: "Bone",
    tags: [],
    description: "TODO: add a witty description.",
    weight: 0.5,
  },
  skull: {
    name: "Skull",
    tags: [],
    description: "TODO: add a witty description.",
    weight: 1,
  },
  eyeball: {
    name: "Eyeball",
    tags: [],
    description: "A squishy eyeball that fell from it's socket",
    weight: 0.2,
  },
  equipment1: {
    name: "Test Equipment",
    tags: [ItemTag.Equipment],
    description: "This is a test equipment.",
    weight: 1,
  } satisfies EquipmentDefinition,
  equipment2: {
    name: "Test Equipment 2",
    tags: [ItemTag.Equipment],
    description: "This is another test equipment.",
    weight: 2,
  } satisfies EquipmentDefinition,
  chestplate1: {
    name: "Test Chestplate",
    tags: [ItemTag.Equipment],
    description: "This is a test chestplate.",
    weight: 1,
    slot: EquipmentSlot.Chest,
  } satisfies EquipmentDefinition,
  consumable1: {
    name: "Test Consumable",
    tags: [ItemTag.Consumable],
    description: "This is a test consumable.",
    weight: 1,
  } satisfies ConsumableDefinition,
  rustySword: {
    name: "Rusty Sword",
    tags: [ItemTag.Equipment],
    description: "A rusty old sword, not very effective.",
    weight: 3,
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
} as Record<ItemId, ItemDefinition>);

export default items;
