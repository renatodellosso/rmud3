import {
  ConsumableDefinition,
  EquipmentDefinition,
  ItemDefinition,
} from "lib/types/item";
import * as Abilities from "lib/gamedata/Abilities";
import { PlayerInstance } from "lib/types/entities/player";
import { getIo } from "lib/ClientFriendlyIo";
import Guild from "lib/types/Guild";
import { chance, savePlayer } from "lib/utils";
import reforges from "../gamedata/Reforges";
import * as CanTarget from "lib/gamedata/CanTarget";
import { Location } from "lib/types/Location";
import { DungeonLocation } from "lib/dungeongeneration/types";
import { CreatureInstance } from "lib/types/entities/creature";
import { DamageType } from "lib/types/Damage";
import AbilityScore from "lib/types/AbilityScore";
import { ItemTag, EquipmentSlot } from "lib/types/itemenums";
import locations from "lib/locations";
import { teleportScroll } from "./itemtemplate";

export type ItemId =
  | "bone"
  | "skull"
  | "eyeball"
  | "rustySword"
  | "money"
  | "healthPotion"
  | "boneNecklace"
  | "slime"
  | "slimeJar"
  | "slimeEgg"
  | "rottenFlesh"
  | "taintedFlesh"
  | "trollTooth"
  | "trollHeart"
  | "mushroom"
  | "certificateOfAchievement"
  | "bigStick"
  | "leather"
  | "silk"
  | "leatherTunic"
  | "bottle"
  | "rope"
  | "boneClub"
  | "tailFlail"
  | "sling"
  | "memory"
  | "nightmare"
  | "ectoplasm"
  | "meat"
  | "grilledMeat"
  | "salt"
  | "saltedMeat"
  | "delversMeal"
  | "ratTail"
  | "repulsiveNecklace"
  | "coal"
  | "ironOre"
  | "ironBar"
  | "goldOre"
  | "goldBar"
  | "ironSpear"
  | "ironAxe"
  | "ironMace"
  | "ironShortSword"
  | "ironLongSword"
  | "ironDagger"
  | "ironHelmet"
  | "ironChestplate"
  | "ironBoots"
  | "backpack"
  | "carvingStone"
  | "guildStone"
  | "fireballRing"
  | "spore"
  | "fungalCore"
  | "unnaturalHeart"
  | "faruluHead"
  | "faruluHands"
  | "fungalSpear"
  | "fungalSword"
  | "fungalChestplate"
  | "paddedBoots"
  | "fungalBackpack"
  | "finalStandEarring"
  | "indomitableEarring"
  | "possessedSkull"
  | "hordeFlute"
  | "spectralDust"
  | "inertDust"
  | "spectralShield"
  | "spectralBoots"
  | "dreamersMask"
  | "dreamripper"
  | "dreamingDust"
  | "wakingDust"
  | "phaseOutRing"
  | "spiderFang"
  | "venom"
  | "antidote"
  | "fangbearerAnklet"
  | "spiderCloak"
  | "mandibleHelmet"
  | "theMaw"
  | "paper"
  | "returnScroll"
  | "teleportScroll3";

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
    getSellValue: 5,
    slot: EquipmentSlot.Head,
    getAbilityScores: {
      Strength: 0,
      Constitution: 0,
      Intelligence: 1,
    },
    getDamageResistances: [{ amount: 1, type: DamageType.Slashing }],
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
        [{ amount: 3, type: DamageType.Slashing }]
      ),
    ],
    slot: EquipmentSlot.Hands,
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
      Abilities.heal("Heal", "Heal 5 health.", 0, 5),
    ],
  } as ConsumableDefinition,
  boneNecklace: {
    getName: "Bone Necklace",
    tags: [ItemTag.Equipment],
    description: "A necklace made of thin bones. Increases damage by 1.",
    getWeight: 0.5,
    getSellValue: 10,
    getDamageBonuses: [{ amount: 1, type: "*" }],
  } as EquipmentDefinition,
  slime: {
    getName: "Slime",
    tags: [],
    description: "It's very slimy.",
    getWeight: 0.1,
    getSellValue: 1,
  },
  slimeEgg: {
    getName: "Slime Embryo",
    tags: [],
    description: "A small, pulsating ball of slime. Maybe it will hatch?",
    getWeight: 1,
    getSellValue: 25,
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
  trollHeart: {
    getName: "Troll Heart",
    tags: [],
    description: "An overgrown, pulsating heart. It feels warm to the touch.",
    getWeight: 2,
    getSellValue: 10,
  },
  mushroom: {
    getName: "Mushroom",
    tags: [ItemTag.Consumable],
    description: "A small white mushroom.",
    getWeight: 0.1,
    getSellValue: 1,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal 1 health.", 0, 1),
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
    slot: EquipmentSlot.Hands,
  },
  leather: {
    getName: "Leather",
    description: "Don't mention how you got it.",
    getWeight: 0.5,
    getSellValue: 2,
    tags: [],
  },
  silk: {
    getName: "Silk",
    description: "A soft, smooth fabric. Feels luxurious.",
    getWeight: 0.2,
    getSellValue: 15,
    tags: [],
  },
  leatherTunic: {
    getName: "Leather Tunic",
    description: "A simple leather tunic. Reduces damage taken by 1.",
    getWeight: 2,
    getSellValue: 5,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    getDamageResistances: [{ amount: 1, type: "*" }],
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
    slot: EquipmentSlot.Hands,
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
  tailFlail: {
    getName: "Tail Flail",
    description: "A rat tail flail. Makes your enemies pale.",
    getWeight: 10,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.attack("Flail", "A wild swing of the tail flail.", 3, [
        { amount: 8, type: DamageType.Bludgeoning },
      ]),
    ],
  } satisfies EquipmentDefinition,
  sling: {
    getName: "Sling",
    description: "A simple sling for throwing stones.",
    getWeight: 0.5,
    getSellValue: 5,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.attack("Throw Pebble", "A simple throw of the sling.", 1.5, [
        { amount: 5, type: DamageType.Piercing },
      ]),
      Abilities.attack("Throw Stone", "A simple throw of the sling.", 3, [
        { amount: 8, type: DamageType.Bludgeoning },
      ]),
    ],
  } satisfies EquipmentDefinition,
  memory: {
    getName: "Memory",
    description: "A frail figment of someones mind.",
    getWeight: 0.1,
    getSellValue: 5,
    tags: [],
  },
  nightmare: {
    getName: "Nightmare",
    description:
      "A dark, twisted memory that haunts your dreams. It weighs on your mind.",
    getWeight: 0.1,
    getSellValue: 20,
    tags: [],
  },
  ectoplasm: {
    getName: "Ectoplasm",
    description: "A slimy, ghostly substance that feels cold to the touch.",
    getWeight: 0.2,
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
      Abilities.heal("Heal", "Heal 5 health.", 0, 5),
    ],
  } satisfies ConsumableDefinition,
  saltedMeat: {
    getName: "Salted Meat",
    tags: [ItemTag.Consumable],
    description: "A grilled and salted chunk of meat from an unknown source.",
    getWeight: 0.6,
    getSellValue: 5,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal 10 health.", 0, 10),
    ],
  } satisfies ConsumableDefinition,
  delversMeal: {
    getName: "Delver's Meal",
    tags: [ItemTag.Consumable],
    description:
      "A hearty meal made for dungeon delvers. Grants Satiated (10) for 300s.",
    getWeight: 2,
    getSellValue: 25,
    getAbilities: (creature, item) => [
      Abilities.healWithStatusEffect(
        "Heal",
        "Heal a moderate amount of health.",
        0,
        20,
        [
          {
            id: "satiated",
            strength: 10,
            duration: 300,
          },
        ]
      ),
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
      "A necklace made of all things disturbing. Turns physical damage you deal into psychic damage.",
    getWeight: 0.5,
    getSellValue: 15,
    // I want this to do something weird but I haven't thought of something clever yet
    getDamageToDeal: (creature, source, damage) =>
      damage.map((d) => ({
        amount: d.amount,
        type:
          d.type == DamageType.Bludgeoning ||
          d.type === DamageType.Slashing ||
          d.type === DamageType.Piercing
            ? DamageType.Psychic
            : d.type,
      })),
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
  goldOre: {
    getName: "Gold Ore",
    tags: [],
    description: "A simple lump of gold ore.",
    getWeight: 0.75,
    getSellValue: 4,
  },
  goldBar: {
    getName: "Gold Bar",
    tags: [],
    description:
      "You can see your reflection on the surface of this smooth gold bar.",
    getWeight: 1.5,
    getSellValue: 10,
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
    getDamageResistances: [{ amount: 2, type: "*" }],
  } satisfies EquipmentDefinition,
  ironChestplate: {
    getName: "Iron Chestplate",
    description: "A simple chestplate. Reduces damage taken by 2.",
    getWeight: 8,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    getDamageResistances: [{ amount: 2, type: "*" }],
  } satisfies EquipmentDefinition,
  ironBoots: {
    getName: "Iron Boots",
    description: "A simple pair of boots. Reduces damage taken by 2.",
    getWeight: 6,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Legs,
    getDamageResistances: [{ amount: 2, type: "*" }],
  } satisfies EquipmentDefinition,
  backpack: {
    getName: "Backpack",
    description: "A sturdy backpack to carry your items.",
    getWeight: 1,
    getSellValue: 20,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Back,
    getCarryingCapacity: 25,
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

                savePlayer(creature as PlayerInstance);
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
      `Guild Stone of ${(item as any).guildName ?? "No Guild"}`,
    description:
      "A stone that represents your guild. Give this to someone to invite them to your guild.",
    getWeight: 1,
    getSellValue: 0,
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

                Guild.fromId((item as any).guildId).then((guild) => {
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
                });

                return true;
              },
            },
          ]
        : [],
  },
  fireballRing: {
    getName: "Fireball Ring",
    tags: [ItemTag.Equipment],
    description: "A ring that allows you to cast fireball.",
    getWeight: 0.5,
    getSellValue: 100,
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Fireball",
        "Throw a fireball.",
        5,
        [{ amount: 10, type: DamageType.Fire }],
        [
          {
            id: "burning",
            strength: 5,
            duration: 3, // Duration in seconds
          },
        ]
      ),
    ],
  },
  spore: {
    getName: "Spore",
    tags: [ItemTag.Consumable],
    description: "A small spore.",
    getWeight: 0.1,
    getSellValue: 5,
    getAbilities: (creature, item) => [
      Abilities.applyStatusEffect(
        "Infest",
        "Infest a target with spores, dealing damage after a period of time.",
        2,
        [
          {
            id: "infested",
            strength: 2,
            duration: 4, // Duration in seconds
          },
        ]
      ),
    ],
  },
  fungalCore: {
    getName: "Fungal Core",
    tags: [],
    description: "A core of a giant mushroom.",
    getWeight: 5,
    getSellValue: 40,
  },
  unnaturalHeart: {
    getName: "Unnatural Heart",
    tags: [ItemTag.Consumable],
    description:
      "A troll heart, infested with spores and covered in slime, that beats unnaturally. Use to challenge Farulu, the Fungal Abomination.",
    getWeight: 10,
    getSellValue: 100,
    getAbilities: (creature, item) => [
      {
        name: "Challenge Farulu, Fungal Abomination",
        getDescription: "Challenge Farulu, the Fungal Abomination.",
        getCooldown: 60,
        getTargetCount: 1,
        canTarget: CanTarget.isTargetALocation,
        activate: (creature, targets) => {
          const target = targets[0] as DungeonLocation;

          if (!("floor" in target)) {
            getIo().sendMsgToPlayer(
              creature._id.toString(),
              "You can only challenge Farulu in the dungeon."
            );
            return false;
          }

          target.entities.add(new CreatureInstance("farulu", target.id));

          const io = getIo();
          io.sendMsgToPlayer(
            creature._id.toString(),
            "You challenge Farulu, the Fungal Abomination!"
          );
          io.updateGameStateForRoom(target.id);

          return true;
        },
      },
    ],
  } satisfies ConsumableDefinition,
  faruluHead: {
    getName: "Farulu's Head",
    tags: [ItemTag.Equipment],
    description:
      "The head of Farulu, the Fungal Abomination. It is still twitching. Reduces all damage taken by 1.",
    getWeight: 10,
    getSellValue: 200,
    slot: EquipmentSlot.Head,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Spore Explosion",
        "Explode with spores, dealing damage and infesting nearby creatures.",
        5,
        [{ amount: 15, type: DamageType.Piercing }],
        [
          {
            id: "infested",
            strength: 10,
            duration: 5, // Duration in seconds
          },
        ]
      ),
    ],
    getDamageResistances: [{ amount: 1, type: "*" }],
  } satisfies EquipmentDefinition,
  faruluHands: {
    getName: "Farulu's Hands",
    tags: [ItemTag.Equipment],
    description:
      "The hands of Farulu, the Fungal Abomination. Slimy, but you could stick your hands in. Reduces all damage taken by 1.",
    getWeight: 10,
    getSellValue: 200,
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Spore Punch",
        "A powerful punch that infests the target with spores.",
        2.5,
        [{ amount: 7, type: DamageType.Bludgeoning }],
        [
          {
            id: "infested",
            strength: 8,
            duration: 4, // Duration in seconds
          },
        ]
      ),
    ],
    getDamageResistances: [{ amount: 1, type: "*" }],
  } satisfies EquipmentDefinition,
  fungalSpear: {
    getName: "Fungal Spear",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A fungus-covered spear.",
    getWeight: 4,
    getSellValue: 40,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Stab",
        "A basic stab attack.",
        1.5,
        [{ amount: 7, type: DamageType.Piercing }],
        [
          {
            id: "infested",
            strength: 5,
            duration: 3, // Duration in seconds
          },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  fungalSword: {
    getName: "Fungal Sword",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A fungus-covered sword.",
    getWeight: 4,
    getSellValue: 40,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Slash",
        "A basic slash attack.",
        3,
        [{ amount: 12, type: DamageType.Slashing }],
        [
          {
            id: "infested",
            strength: 6,
            duration: 3, // Duration in seconds
          },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  fungalChestplate: {
    getName: "Fungal Chestplate",
    tags: [ItemTag.Equipment],
    description: `A chestplate made of tough fungal material.`,
    getWeight: 12,
    getSellValue: 150,
    slot: EquipmentSlot.Chest,
    getDamageResistances: [
      { amount: 2, type: "*" },
      { amount: 1, type: DamageType.Bludgeoning },
    ],
    getAbilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 1,
    },
  } satisfies EquipmentDefinition,
  paddedBoots: {
    getName: "Padded Boots",
    tags: [ItemTag.Equipment],
    description:
      "A pair of boots, padded with- well, don't ask. Reduces all damage taken by 2 and bludgeoning damage by an extra 1.",
    getWeight: 2,
    getSellValue: 40,
    slot: EquipmentSlot.Legs,
    getDamageResistances: [
      { amount: 2, type: "*" },
      { amount: 1, type: DamageType.Bludgeoning },
    ],
  },
  fungalBackpack: {
    getName: "Fungal Backpack",
    tags: [ItemTag.Equipment],
    description:
      "A backpack made of tough fungal material. It has a strange smell.",
    getWeight: 3,
    getSellValue: 50,
    slot: EquipmentSlot.Back,
    getCarryingCapacity: 40,
  } satisfies EquipmentDefinition,
  finalStandEarring: {
    getName: "Final Stand Earring",
    tags: [ItemTag.Equipment],
    description: `Somehow, the piercing never stops bleeding. Deal 50% more damage when below 20% health, 
      but take 10% more damage at any amount of health.`,
    getWeight: 0.1,
    getSellValue: 100,
    getDamageToDeal: (creature, source, damage) =>
      damage.map((d) => ({
        amount:
          creature.health < 0.2 * creature.getMaxHealth()
            ? d.amount * 1.5
            : d.amount,
        type: d.type,
      })),
    getDamageToTake: (creature, source, damage) =>
      damage.map((d) => ({
        amount: d.amount * 1.1,
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  indomitableEarring: {
    getName: "Indomitable Earring",
    tags: [ItemTag.Equipment],
    description: `Somehow, the piercing never stops bleeding. Deal 70% more damage when below 30% health, 
      but take 20% more damage at any amount of health.`,
    getWeight: 0.1,
    getSellValue: 100,
    getDamageToDeal: (creature, source, damage) =>
      damage.map((d) => ({
        amount:
          creature.health < 0.3 * creature.getMaxHealth()
            ? d.amount * 1.7
            : d.amount,
        type: d.type,
      })),
    getDamageToTake: (creature, source, damage) =>
      damage.map((d) => ({
        amount: d.amount * 1.2,
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  possessedSkull: {
    getName: "Possessed Skull",
    tags: [ItemTag.Equipment],
    description: `A skull that seems to have a mind of its own. It whispers to you, but you can't understand it. 
      Reduces damage you take by 20%, if that damage would otherwise kill you`,
    getWeight: 1,
    getSellValue: 50,
    slot: EquipmentSlot.Head,
    getDamageToTake: (creature, source, damage) =>
      damage.map((d) => ({
        amount: d.amount >= creature.health ? d.amount * 0.8 : d.amount,
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  hordeFlute: {
    getName: "Horde Flute",
    tags: [ItemTag.Consumable],
    description: "A flute that summons a horde of zombies. Use wisely.",
    getWeight: 0.5,
    getSellValue: 25,
    getAbilities: (creature, item) => [
      {
        name: "Summon Horde",
        getDescription: "Summon a horde of zombies.",
        getCooldown: 60,
        getTargetCount: 1,
        canTarget: CanTarget.isTargetALocation,
        activate: (creature, targets) => {
          const target = targets[0] as DungeonLocation;

          if (!("floor" in target)) {
            getIo().sendMsgToPlayer(
              creature._id.toString(),
              "You can only summon a horde in the dungeon."
            );
            return false;
          }

          for (let i = 0; i < 5; i++) {
            target.entities.add(new CreatureInstance("zombie", target.id));
          }

          const io = getIo();
          io.sendMsgToPlayer(
            creature._id.toString(),
            "You play the horde flute, summoning a horde of creatures!"
          );
          io.updateGameStateForRoom(target.id);

          return true;
        },
      },
    ],
  } satisfies ConsumableDefinition,
  salt: {
    getName: "Salt",
    tags: [],
    description: "A pinch of salt, useful for seasoning food.",
    getWeight: 0.1,
    getSellValue: 5,
  },
  spectralShield: {
    getName: "Spectral Shield",
    tags: [ItemTag.Equipment],
    description:
      "A shield that seems to be made of pure energy. It shimmers in the light.",
    getWeight: 5,
    getSellValue: 100,
    slot: EquipmentSlot.Hands,
    getDamageResistances: [
      { amount: 3, type: "*" },
      { amount: 5, type: DamageType.Psychic },
    ],
  } satisfies EquipmentDefinition,
  spectralBoots: {
    getName: "Spectral Boots",
    tags: [ItemTag.Equipment],
    description:
      "Boots that seem to be made of pure energy. They shimmer in the light. Reduces cooldowns by 5%.",
    getWeight: 5,
    getSellValue: 100,
    slot: EquipmentSlot.Legs,
    getDamageResistances: [
      { amount: 2, type: "*" },
      { amount: 3, type: DamageType.Psychic },
    ],
    getCooldown: (creature, source, ability, cooldown) => cooldown * 0.95,
  } satisfies EquipmentDefinition,
  dreamripper: {
    getName: "Dreamripper",
    tags: [ItemTag.Equipment],
    description:
      "A wicked dagger that seems to shimmer with a dark light. Voices from the other side whisper to you in your sleep.",
    getWeight: 0.2,
    getSellValue: 150,
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Dream Slash",
        "A quick slash that rips through the fabric of dreams.",
        1.2,
        [
          { amount: 8, type: DamageType.Piercing },
          { amount: 2, type: DamageType.Psychic },
        ],
        [
          {
            id: "cursed",
            strength: 1,
            duration: 3, // Duration in seconds
          },
        ]
      ),
      Abilities.attackWithStatusEffect(
        "Pierce the Veil",
        "Pierce the veil between worlds, dealing damage and applying a curse. Deals 5 damage to yourself.",
        3,
        [
          { amount: 10, type: DamageType.Piercing },
          { amount: 5, type: DamageType.Psychic },
        ],
        [
          {
            id: "cursed",
            strength: 2,
            duration: 5, // Duration in seconds
          },
        ],
        {
          onActivate: (creature, targets, source) => {
            const damage = creature.takeDamage(
              [
                {
                  amount: 5,
                  type: DamageType.Psychic,
                },
              ],
              source,
              creature
            );

            getIo().sendMsgToPlayer(
              creature._id.toString(),
              `You pierce the veil, dealing ${damage
                .map((d) => `${d.amount} ${d.type}`)
                .join(", ")} damage to yourself!`
            );
          },
        }
      ),
    ],
  },
  dreamersMask: {
    getName: "Dreamer's Veil",
    tags: [ItemTag.Equipment],
    description: "A translucent veil, filled with dreaming dust.",
    getWeight: 1,
    getSellValue: 100,
    slot: EquipmentSlot.Head,
    getAbilityScores: {
      Strength: 0,
      Constitution: 0,
      Intelligence: 15,
    },
    getDamageResistances: [{ amount: 7, type: DamageType.Psychic }],
  } satisfies EquipmentDefinition,
  spectralDust: {
    getName: "Spectral Dust",
    description: "A fine dust that seems to shimmer in the light.",
    tags: [],
    getWeight: 0.1,
    getSellValue: 20,
  },
  inertDust: {
    getName: "Inert Dust",
    description: "A fine, grey dust that seems to have no effect.",
    tags: [],
    getWeight: 0.1,
    getSellValue: 10,
  },
  dreamingDust: {
    getName: "Dreaming Dust",
    description: "A dust that seems to shimmer with a dark light.",
    tags: [ItemTag.Consumable],
    getWeight: 0.1,
    getSellValue: 50,
    getAbilities: (creature, item) => [
      Abilities.applyStatusEffect(
        "Inhale",
        "Put the target into a dreaming state, slowing their mind, but heightening their senses.",
        0,
        [
          {
            id: "dreaming",
            strength: 25,
            duration: 60,
          },
        ]
      ),
    ],
  } satisfies ConsumableDefinition,
  wakingDust: {
    getName: "Waking Dust",
    description: "A dust that seems to shimmer with a bright light.",
    tags: [ItemTag.Consumable],
    getWeight: 0.1,
    getSellValue: 50,
    getAbilities: (creature, item) => [
      {
        name: "Inhale",
        getDescription:
          "Put the target into a waking state, slowing their mind, but heightening their senses.",
        getCooldown: 0,
        getTargetCount: 1,
        canTarget: CanTarget.isSelf,
        activate: (creature, targets) => {
          const target = targets[0] as CreatureInstance;

          target.statusEffects = [];

          getIo().sendMsgToPlayer(
            creature._id.toString(),
            `You removed all status effects from ${target.name}.`
          );

          return true;
        },
      },
    ],
  } satisfies ConsumableDefinition,
  phaseOutRing: {
    getName: "Phasing Ring",
    tags: [ItemTag.Equipment],
    description: `A ring that allows the wearer to phase out of reality temporarily. Grants a 5% chance to avoid damage taken.`,
    getWeight: 0.2,
    getSellValue: 400,
    getDamageToTake: (creature, source, damage) => (chance(0.05) ? [] : damage),
  } satisfies EquipmentDefinition,
  spiderFang: {
    getName: "Spider Fang",
    tags: [],
    description: "A sharp fang from a giant spider.",
    getWeight: 0.1,
    getSellValue: 15,
  },
  venom: {
    getName: "Venom",
    tags: [],
    description: "A vial of spider venom, still bubbling.",
    getWeight: 0.1,
    getSellValue: 20,
  },
  antidote: {
    getName: "Antidote",
    tags: [ItemTag.Consumable],
    description: "A vial of antidote, used to cure poison.",
    getWeight: 0.1,
    getSellValue: 35,
    getAbilities: (creature, item) => [
      {
        name: "Cure Poison",
        getDescription: "Cure poison from the target.",
        getCooldown: 0,
        getTargetCount: 1,
        canTarget: CanTarget.and(CanTarget.isSelf, (creature, target) =>
          (target as CreatureInstance).statusEffects?.some(
            (s) => s.definitionId === "poisoned"
          )
        ),
        activate: (creature, targets) => {
          const target = targets[0] as CreatureInstance;

          target.statusEffects = target.statusEffects.filter(
            (s) => s.definitionId !== "poisoned"
          );

          getIo().sendMsgToPlayer(
            creature._id.toString(),
            `You cured poison from ${target.name}.`
          );

          return true;
        },
      },
    ],
  } satisfies ConsumableDefinition,
  fangbearerAnklet: {
    getName: "Fangbearer Anklet",
    tags: [ItemTag.Equipment],
    description: `An iron anklet, continually injecting venom into your bloodstream. 
      Adds Poisoned (1) for 1s every second, but increases your intelligence by 15 and all XP gain by 10%.`,
    getWeight: 0.5,
    getSellValue: 250,
    tick: (creature) => {
      if (!creature.statusEffects.some((s) => s.definitionId === "poisoned")) {
        creature.addStatusEffect({
          id: "poisoned",
          strength: 1,
          duration: 1, // Duration in seconds
        });
      }
    },
    getAbilityScores: {
      [AbilityScore.Intelligence]: 15,
    },
    getXpToAdd: (player, source, amount) => amount * 1.1,
  } satisfies EquipmentDefinition,
  spiderCloak: {
    getName: "Spider Cloak",
    tags: [ItemTag.Equipment],
    description: `A cloak made from the silk of giant spiders. Grants the wearer increased stealth and agility.`,
    getWeight: 0.5,
    getSellValue: 300,
    getDamageResistances: () => [
      {
        amount: 10,
        type: DamageType.Poison,
      },
      {
        amount: 3,
        type: "*",
      },
    ],
  } satisfies EquipmentDefinition,
  mandibleHelmet: {
    getName: "Mandible Helmet",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    description: `A helmet made from the mandibles of giant spiders. Adds 3 poison damage to all attacks.`,
    getWeight: 0.5,
    getSellValue: 350,
    getDamageResistances: () => [
      {
        amount: 5,
        type: DamageType.Poison,
      },
      {
        amount: 2,
        type: "*",
      },
    ],
    getDamageToDeal: (creature, source, damage) => [
      ...damage,
      {
        amount: 3,
        type: DamageType.Poison,
      },
    ],
  } satisfies EquipmentDefinition,
  theMaw: {
    getName: "The Maw",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `A savage helmet, covered in teeth and fangs. Reduces cooldowns by 10%.`,
    getWeight: 10,
    getSellValue: 500,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Bite",
        "A powerful attack that bites into the target's flesh.",
        5,
        [{ amount: 20, type: DamageType.Piercing }],
        [
          {
            id: "poisoned",
            strength: 2,
            duration: 10, // Duration in seconds
          },
        ]
      ),
    ],
    getCooldown: (creature, source, ability, cooldown) => cooldown * 0.9,
    getDamageResistances: () => [
      {
        amount: 8,
        type: DamageType.Poison,
      },
      {
        amount: 3,
        type: "*",
      },
    ],
  } satisfies EquipmentDefinition,
  paper: {
    getName: "Paper",
    description: "A simple piece of paper.",
    getWeight: 0.01,
    getSellValue: 1,
    tags: [],
  },
  returnScroll: {
    getName: "Return Scroll",
    tags: [ItemTag.Consumable],
    description: "A scroll that returns you to the town.",
    getWeight: 0.1,
    getSellValue: 75,
    getAbilities: (creature, item) => [
      {
        name: "Return",
        getDescription: "Return to the town.",
        getCooldown: 0,
        getTargetCount: 1,
        canTarget: CanTarget.isSelf,
        activate: (creature, targets) => {
          const target = targets[0] as CreatureInstance;

          locations["dungeon-entrance"].enter(target);

          getIo().sendMsgToPlayer(
            creature._id.toString(),
            `You return to the town.`
          );

          return true;
        },
      },
    ],
  } satisfies ConsumableDefinition,
  teleportScroll3: teleportScroll(3),
} satisfies Record<ItemId, ItemDefinition | EquipmentDefinition | ConsumableDefinition>);

export default items;
