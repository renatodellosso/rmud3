import {
  ConsumableDefinition,
  EquipmentDefinition,
  EquipmentSlot,
  ItemDefinition,
  ItemTag,
} from "lib/types/item";
import * as Abilities from "lib/gamedata/Abilities";
import { DamageType } from "lib/types/types";
import { PlayerInstance } from "lib/types/entities/player";
import { getIo } from "lib/ClientFriendlyIo";
import Guild from "lib/types/Guild";

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
  | "certificateOfAchievement"
  | "bigStick"
  | "leather"
  | "leatherTunic"
  | "bottle"
  | "slimeJar"
  | "rope"
  | "boneClub"
  | "memory"
  | "meat"
  | "grilledMeat"
  | "ratTail"
  | "repulsiveNecklace"
  | "coal"
  | "ironOre"
  | "ironBar"
  | "ironSpear"
  | "ironAxe"
  | "ironMace"
  | "ironShortSword"
  | "ironLongSword"
  | "ironDagger"
  | "ironHelmet"
  | "ironChestplate"
  | "ironBoots"
  | "carvingStone"
  | "guildStone";

const items: Record<ItemId, ItemDefinition> = Object.freeze({
  bone: {
    getName: "Bone",
    tags: [],
    description: "Looks like you had a bone to pick with someone.",
    getWeight: 0.5,
    getSellValue: 1,
  },
  skull: {
    getName: "Skull",
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
    getName: "Eyeball",
    tags: [],
    description: "A squishy eyeball that fell from it's socket.",
    getWeight: 0.2,
    getSellValue: 1,
  },
  rustySword: {
    getName: "Rusty Sword",
    tags: [ItemTag.Equipment],
    description: "A rusty old sword, not very effective.",
    getWeight: 3,
    getSellValue: 5,
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Rusty Slash",
        "A basic slash attack with the rusty sword.",
        1,
        [{ amount: 2, type: DamageType.Slashing }]
      ),
    ],
  } satisfies EquipmentDefinition,
  money: {
    getName: "Silver Coins",
    tags: [],
    description: "A small silver coin.",
    getWeight: 0,
    getSellValue: 1,
  },
  healthPotion: {
    getName: "Health Potion",
    tags: [ItemTag.Consumable],
    description: "A red solution in a small bottle.",
    getWeight: 0.5,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal a small amount of health.", 0, 5),
    ],
  } as ConsumableDefinition,
  boneNecklace: {
    getName: "Bone Necklace",
    tags: [ItemTag.Equipment],
    description: "A necklace made of thin bones. Increases damage by 1.",
    getWeight: 0.5,
    getSellValue: 10,
    getDamageToDeal: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount + 1,
        type: d.type,
      })),
  } as EquipmentDefinition,
  slime: {
    getName: "Slime",
    tags: [],
    description: "It's very slimy.",
    getWeight: 0.1,
    getSellValue: 1,
  },
  rottenFlesh: {
    getName: "Rotten Flesh",
    tags: [],
    description: "A disgusting and rotting chunk of flesh.",
    getWeight: 1,
    getSellValue: 2,
  },
  taintedFlesh: {
    getName: "Tainted Flesh",
    tags: [],
    description: "A discolored and corrupted slab of meat.",
    getWeight: 1,
    getSellValue: 4,
  },
  trollTooth: {
    getName: "Troll Tooth",
    tags: [],
    description: "This yellow tooth is bigger than any you've seen.",
    getWeight: 0.2,
    getSellValue: 2,
  },
  mushroom: {
    getName: "Mushroom",
    tags: [ItemTag.Consumable],
    description: "A small white mushroom.",
    getWeight: 0.1,
    getSellValue: 1,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal a small amount of health.", 0, 1),
    ],
  } satisfies ConsumableDefinition,
  certificateOfAchievement: {
    getName: "Certificate of Achievement",
    tags: [],
    description: "Congratulations! You have completed the tutorial!",
    getWeight: 0,
    getSellValue: 0,
  },
  bigStick: {
    getName: "Big Stick",
    tags: [ItemTag.Equipment],
    description: "Well, if you can't have a sword...",
    getWeight: 5,
    getSellValue: 0,
    getAbilities: (creature, item) => [
      Abilities.attack("Whack", "WHACK!", 1.5, [
        { amount: 5, type: DamageType.Bludgeoning },
      ]),
    ],
  },
  leather: {
    getName: "Leather",
    description: "Don't mention how you got it.",
    getWeight: 0.5,
    getSellValue: 2,
    tags: [],
  },
  leatherTunic: {
    getName: "Leather Tunic",
    description: "A simple leather tunic. Reduces damage taken by 1.",
    getWeight: 2,
    getSellValue: 5,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    getDamageToTake: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount - 1, // Reduces damage taken by 1
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  bottle: {
    getName: "Bottle",
    description:
      "A glass bottle, perfect for storing things. Just don't drop it!",
    getWeight: 0.5,
    getSellValue: 5,
    tags: [],
  },
  slimeJar: {
    getName: "Slime Bottle",
    description: "A bottle filled with a strange, glowing slime.",
    getWeight: 0.5,
    getSellValue: 10,
    tags: [ItemTag.Consumable],
    getAbilities: (creature, item) => [
      Abilities.applyStatusEffect(
        "Slime Splash",
        "Splash the target with slime.",
        1,
        [
          {
            id: "infested",
            strength: 15,
            duration: 5, // Duration in seconds
          },
        ]
      ),
    ],
  },
  rope: {
    getName: "Rope",
    description: "A sturdy rope, useful for climbing or tying things up.",
    getWeight: 1,
    getSellValue: 3,
    tags: [],
  },
  boneClub: {
    getName: "Bone Club",
    tags: [ItemTag.Equipment],
    description: "A giant club made of bone.",
    getWeight: 15,
    getSellValue: 20,
    getAbilityScores: {
      Strength: 3,
      Constitution: 0,
      Intelligence: 0,
    },
    getAbilities: (creature, item) => [
      Abilities.attack("Smash", "A basic swing of the club.", 2, [
        { amount: 10, type: DamageType.Bludgeoning },
      ]),
      Abilities.attackWithStatusEffect(
        "Stunning Strike",
        "A powerful strike that stuns the target.",
        4,
        [{ amount: 5, type: DamageType.Bludgeoning }],
        [
          {
            id: "stunned",
            strength: 3,
            duration: 2, // Duration in seconds
          },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  memory: {
    getName: "Memory",
    description: "A frail figment of someones mind.",
    getWeight: 0.1,
    getSellValue: 5,
    tags: [],
  },
  meat: {
    getName: "Meat",
    description: "A chunk of meat from an unknown source.",
    getWeight: 0.5,
    getSellValue: 2,
    tags: [],
  },
  grilledMeat: {
    getName: "Grilled Meat",
    tags: [ItemTag.Consumable],
    description: "A grilled chunk of meat from an unknown source.",
    getWeight: 0.5,
    getSellValue: 3,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal a small amount of health.", 0, 3),
    ],
  } satisfies ConsumableDefinition,
  ratTail: {
    getName: "Rat Tail",
    description: "It's hairless, long, and a bit disturbing.",
    getWeight: 0.1,
    getSellValue: 2,
    tags: [],
  },
  repulsiveNecklace: {
    getName: "Repulsive Necklace",
    tags: [ItemTag.Equipment],
    description:
      "A necklace made of all things disturbing. Increases damage by 1.",
    getWeight: 0.5,
    getSellValue: 15,
    // I want this to do something weird but I haven't thought of something clever yet
  } as EquipmentDefinition,
  coal: {
    getName: "Coal",
    tags: [],
    description: "A simple lump of coal.",
    getWeight: 0.5,
    getSellValue: 2,
  },
  ironOre: {
    getName: "Iron Ore",
    tags: [],
    description: "A simple lump of iron ore.",
    getWeight: 0.5,
    getSellValue: 2,
  },
  ironBar: {
    getName: "Iron Bar",
    tags: [],
    description: "The light reflects off the surface of this smooth iron bar.",
    getWeight: 1,
    getSellValue: 5,
  },
  // All these basic iron weapons do 3.33 dps
  ironSpear: {
    getName: "Iron Spear",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A simple spear.",
    getWeight: 3,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Stab",
        "A basic stab attack with a simple spear.",
        1.5,
        [{ amount: 5, type: DamageType.Piercing }]
      ),
    ],
  } satisfies EquipmentDefinition,
  ironAxe: {
    getName: "Iron Axe",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A simple axe.",
    getWeight: 4,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.attack("Chop", "A basic chop attack with a simple axe.", 1.8, [
        { amount: 6, type: DamageType.Piercing },
      ]),
    ],
  } satisfies EquipmentDefinition,
  ironMace: {
    getName: "Iron Mace",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A simple mace.",
    getWeight: 5,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.attack("Slam", "A basic slam attack with a simple mace.", 2.1, [
        { amount: 7, type: DamageType.Bludgeoning },
      ]),
    ],
  } satisfies EquipmentDefinition,
  ironShortSword: {
    getName: "Iron Short Sword",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A simple short sword.",
    getWeight: 3,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Stab",
        "A basic stab attack with a simple short sword.",
        0.9,
        [{ amount: 3, type: DamageType.Piercing }]
      ),
    ],
  } satisfies EquipmentDefinition,
  ironLongSword: {
    getName: "Iron Long Sword",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A simple long sword.",
    getWeight: 4,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Slash",
        "A basic slash attack with a simple long sword.",
        0.9,
        [{ amount: 3, type: DamageType.Slashing }]
      ),
    ],
  } satisfies EquipmentDefinition,
  ironDagger: {
    getName: "Iron Dagger",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A simple dagger.",
    getWeight: 2,
    getSellValue: 10,
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Stab",
        "A basic stab attack with a simple dagger.",
        0.6,
        [{ amount: 2, type: DamageType.Piercing }]
      ),
    ],
  } satisfies EquipmentDefinition,
  ironHelmet: {
    getName: "Iron Helmet",
    description: "A simple helmet. Reduces damage taken by 2.",
    getWeight: 5,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    getDamageToTake: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount - 2, // Reduces damage taken by 1
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  ironChestplate: {
    getName: "Iron Chestplate",
    description: "A simple chestplate. Reduces damage taken by 2.",
    getWeight: 8,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    getDamageToTake: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount - 2, // Reduces damage taken by 1
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  ironBoots: {
    getName: "Iron Boots",
    description: "A simple pair of boots. Reduces damage taken by 2.",
    getWeight: 6,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Legs,
    getDamageToTake: (creature, item, damage) =>
      damage.map((d) => ({
        amount: d.amount - 2, // Reduces damage taken by 1
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  carvingStone: {
    getName: "Carving Stone",
    description:
      "A stone used for carving. Maybe you could carve the menhir in the clearing?",
    getWeight: 1,
    getSellValue: 50,
    tags: [ItemTag.Consumable],
    getAbilities: (creature, item) =>
      creature.location === "clearing"
        ? [
            {
              name: "Found Guild",
              getDescription: "Carve a guild symbol into the menhir.",
              getCooldown: 10,
              getTargetCount: 1,
              canTarget: (creature, target) =>
                "definitionId" in target && target.definitionId === "menhir",
              activate: (creature, targets) => {
                if ((creature as PlayerInstance).guildId) {
                  getIo().sendMsgToPlayer(
                    creature._id.toString(),
                    "You are already in a guild! Leave it first."
                  );
                  return false;
                }

                const guild = new Guild(creature._id, [creature._id]);
                guild.name = `${creature.name}'s Guild`;

                (creature as PlayerInstance).guildId = guild._id;
                Guild.upsert(guild);

                getIo().sendMsgToPlayer(
                  creature._id.toString(),
                  "You carve your guild symbol into the menhir, founding your guild."
                );

                return true;
              },
            },
          ]
        : [],
  } satisfies ConsumableDefinition,
  guildStone: {
    getName: (item) =>
      `Guild Stone of ${
        Guild.fromId((item as any).guildId)?.name ?? "Unknown Guild"
      }`,
    description:
      "A stone that represents your guild. Give this to someone to invite them to your guild.",
    getWeight: 1,
    getSellValue: 100,
    tags: [ItemTag.Consumable],
    getAbilities: (creature, item) =>
      creature.location === "clearing"
        ? [
            {
              name: "Join Guild",
              getDescription:
                "Carve your name under the guild's symbol on the menhir.",
              getCooldown: 10,
              getTargetCount: 1,
              canTarget: (creature, target) =>
                "definitionId" in target && target.definitionId === "menhir",
              activate: (creature, targets) => {
                if ((creature as PlayerInstance).guildId) {
                  getIo().sendMsgToPlayer(
                    creature._id.toString(),
                    "You are already in a guild! Leave it first."
                  );
                  return false;
                }

                const guild = Guild.fromId((item as any).guildId);
                if (!guild) {
                  getIo().sendMsgToPlayer(
                    creature._id.toString(),
                    "This guild stone is invalid."
                  );
                  return false;
                }

                (creature as PlayerInstance).guildId = guild._id;
                guild.members.push(creature._id);
                if (!guild.owner) guild.owner = creature._id;

                Guild.upsert(guild);

                getIo().sendMsgToPlayer(
                  creature._id.toString(),
                  "You carve your name under the guild's symbol on the menhir, joining the guild."
                );

                return true;
              },
            },
          ]
        : [],
  },
} satisfies Record<ItemId, ItemDefinition | EquipmentDefinition | ConsumableDefinition>);

export default items;
