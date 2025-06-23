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
  | "bone"
  | "skull"
  | "eyeball"
  | "rustySword"
  | "money"
  | "healthPotion"
  | "boneNecklace"
  | "slime"
  | "rottenFlesh"
  | "taintedFlesh"
  | "trollTooth"
  | "mushroom"
  | "certificateOfAchievement";

const items = Object.freeze({
  bone: {
    name: "Bone",
    tags: [],
    description: "TODO: add a witty description.",
    getWeight: 0.5,
    getSellValue: 1,
  },
  skull: {
    name: "Skull",
    tags: [ItemTag.Equipment],
    description:
      "A well preserved human skull. It could offer some protection.",
    getWeight: 1,
    getSellValue: 2,
    slot: EquipmentSlot.Head,
    getAbilityScores: {
      Strength: 0,
      Constitution: 0,
      Intelligence: 1,
    },
    getDamageToTake: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount - 1, // Reduces damage taken by 1
        type: DamageType.Slashing,
      })),
  } satisfies EquipmentDefinition,
  eyeball: {
    name: "Eyeball",
    tags: [],
    description: "A squishy eyeball that fell from it's socket",
    getWeight: 0.2,
    getSellValue: 1,
  },
  rustySword: {
    name: "Rusty Sword",
    tags: [ItemTag.Equipment],
    description: "A rusty old sword, not very effective.",
    getWeight: 3,
    getSellValue: 5,
    getAbilityScores: {
      Strength: 1,
      Constitution: 0,
      Intelligence: 0,
    },
    getDamageToDeal: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount + 2, // Adds 2 slashing damage
        type: d.type,
      })),
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Rusty Slash",
        "A basic slash attack with the rusty sword.",
        1,
        [{ amount: 5, type: DamageType.Slashing }]
      ),
      Abilities.attackWithStatusEffect(
        "Stunning Strike",
        "A powerful strike that stuns the target.",
        1.5,
        [{ amount: 3, type: DamageType.Bludgeoning }],
        [
          {
            id: "stunned",
            strength: 3,
            duration: 5, // Duration in seconds
          },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  money: {
    name: "Silver Coins",
    tags: [],
    description: "A small silver coin.",
    getWeight: 0,
    getSellValue: 1,
  },
  healthPotion: {
    name: "Health Potion",
    tags: [ItemTag.Consumable],
    description: "A red solution in a small bottle.",
    getWeight: 0.5,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal a small amount of health.", 0, 5),
    ],
  } as ConsumableDefinition,
  boneNecklace: {
    name: "Bone Necklace",
    tags: [ItemTag.Equipment],
    description: "A necklace made of thin bones.",
    getWeight: 0.5,
    getSellValue: 10,
    getDamageToDeal: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount + 1,
        type: d.type,
      })),
  } as EquipmentDefinition,
  slime: {
    name: "Slime",
    tags: [],
    description: "It's very slimy.",
    getWeight: 0.1,
    getSellValue: 1,
  },
  rottenFlesh: {
    name: "Rotten Flesh",
    tags: [],
    description: "A disgusting and rotting chunk of flesh.",
    getWeight: 1,
    getSellValue: 2,
  },
  taintedFlesh: {
    name: "Tainted Flesh",
    tags: [],
    description: "A discolored and corrupted slab of meat.",
    getWeight: 1,
    getSellValue: 4,
  },
  trollTooth: {
    name: "Troll Tooth",
    tags: [],
    description: "This yellow tooth is bigger than any you've seen.",
    getWeight: 0.2,
    getSellValue: 2,
  },
  mushroom: {
    name: "Mushroom",
    tags: [ItemTag.Consumable],
    description: "A small white mushroom.",
    getWeight: 0.1,
    getSellValue: 1,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal a small amount of health.", 0, 1),
    ],
  } satisfies ConsumableDefinition,
  certificateOfAchievement: {
    name: "Certificate of Achievement",
    tags: [],
    description: "Congratulations! You have completed the tutorial!",
    getWeight: 0,
    getSellValue: 0,
  },
} as Record<ItemId, ItemDefinition>);

export default items;
