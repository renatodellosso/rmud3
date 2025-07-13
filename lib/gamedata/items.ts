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
  | "friedEyeball"
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
  | "furyBelt"
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
  | "slimeSling"
  | "slimeHorn"
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
  | "skeletalSword"
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
  | "teleportScroll3"
  | "teleportScroll5"
  | "teleportScroll7"
  | "teleportScroll9"
  | "teleportScroll11"
  | "vine"
  | "livingWood"
  | "hoof"
  | "horseshoe"
  | "livingWoodBow"
  | "livingWoodLongSword"
  | "treantSap"
  | "treantMask"
  | "amuletOfTheCentaur"
  | "sequoia"
  | "skeletonKey"
  | "golemCore"
  | "livingStone"
  | "wailingNecklace"
  | "ancientSpirit"
  | "ancientGreatsword"
  | "ancientBoneNecklace"
  | "ashes"
  | "livingStoneChestplate"
  | "rootBoots"
  | "avalancheWarhammer"
  | "stoneskinPotion"
  | "burnOutScroll"
  | "woodlandHorn"
  | "taintedSpear"
  | "hobspear"
  | "goblinJerkin"
  | "goblinHelmet"
  | "goblinScrap"
  | "goblinIdol"
  | "firebomb"
  | "dart"
  | "poisonDart"
  | "ember"
  | "bubbleShroom"
  | "demonScale"
  | "fortressShell"
  | "midnightShell"
  | "hordeShell"
  | "shellHorn"
  | "enchantingSpirit"
  | "ink"
  | "krakenShellFragment"
  | "krakenClawAxe"
  | "krakenToothDagger"
  | "krakenEyeNecklace"
  | "enrapturingRing"
  | "scaleChestplate"
  | "squidHelmet"
  | "implantableGills"
  | "pocketGolem"
  | "ice"
  | "yetiFur"
  | "frozenCrystal"
  | "giantTooth"
  | "blizzard"
  | "mammoth"
  | "frozenChain"
  | "wintersBreath"
  | "giantCrown"
  | "glacier"
  | "yetiBoots"
  | "yetiSkull"
  | "yetiHead"
  | "volcanicAmulet"
  | "magmaSlimeEgg"
  | "volcanicOmelet"
  | "dragonScale"
  | "wyvernHeart"
  | "dragonHead"
  | "beastScaleArmor"
  | "flamebane"
  | "dragonfireRing"
  | "wingedBackpack"
  | "vengefulRing"
  | "drainingRing"
  | "healthfulAmulet"
  | "horrifyingBow"
  | "undeadChestplate"
  | "undeadHelmet"
  | "undeadBoots"
  | "discountToken"
  | "sirensTrident"
  | "chitinLeggings"
  | "chitinChestplate"
  | "chitinHelmet";

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
  friedEyeball: {
    getName: "Fried Eyeball",
    tags: [ItemTag.Consumable],
    description: "A squishy eyeball that has been fried to a crisp.",
    getWeight: 0.2,
    getSellValue: 2,
    getAbilities: (creature, item) => [
      Abilities.healWithStatusEffect("Heal", "Heal 3 health.", 0, 3, [
        {
          id: "satiated",
          strength: 5,
          duration: 300, // Duration in seconds
        },
      ]),
    ],
  } satisfies ConsumableDefinition,
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
        [{ amount: 4, type: DamageType.Slashing }]
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
  furyBelt: {
    getName: "Fury Belt",
    tags: [ItemTag.Equipment],
    description: "A belt made of troll hide.",
    getWeight: 1,
    getSellValue: 25,
    getAbilities: [
      Abilities.applyStatusEffect(
        "Roar",
        "Let out a mighty roar.",
        1,
        [
          {
            id: "overcharged",
            strength: 2,
            duration: 10,
          },
        ],
        {
          targetRestrictions: [CanTarget.isSelf],
        }
      ),
    ],
  } satisfies EquipmentDefinition,
  mushroom: {
    getName: "Mushroom",
    tags: [ItemTag.Consumable],
    description: "A small white mushroom.",
    getWeight: 0.1,
    getSellValue: 1,
    getAbilities: (creature, item) => [
      Abilities.heal("Heal", "Heal 2 health.", 0, 2),
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
      Abilities.attack("Flail", "A wild swing of the tail flail.", 1.3, [
        { amount: 6, type: DamageType.Bludgeoning },
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
      Abilities.attack("Throw Pebble", "A simple throw of the sling.", 1.1, [
        { amount: 5, type: DamageType.Piercing },
      ]),
      Abilities.attack("Throw Stone", "A simple throw of the sling.", 2, [
        { amount: 9, type: DamageType.Bludgeoning },
      ]),
    ],
  } satisfies EquipmentDefinition,
  slimeSling: {
    getName: "Slime Sling",
    description: "A sling that uses slime as ammunition.",
    getWeight: 0.5,
    getSellValue: 10,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Throw Slime",
        "A messy throw of the slime sling.",
        1.3,
        [{ amount: 6, type: DamageType.Piercing }],
        [
          {
            id: "infested",
            strength: 3,
            duration: 3,
          },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  slimeHorn: {
    getName: "Slime Horn",
    description: "A horn to call slimes to your aid.",
    getWeight: 1,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.summon(
        "Call Slime",
        "Summon a friendly slime to aid you in battle.",
        60,
        [{ id: "friendlySlime", amount: 1 }]
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
      Abilities.healWithStatusEffect("Heal", "Heal 5 health.", 0, 5, [
        {
          id: "satiated",
          strength: 10,
          duration: 300,
        },
      ]),
    ],
  } satisfies ConsumableDefinition,
  saltedMeat: {
    getName: "Salted Meat",
    tags: [ItemTag.Consumable],
    description: "A grilled and salted chunk of meat from an unknown source.",
    getWeight: 0.6,
    getSellValue: 5,
    getAbilities: (creature, item) => [
      Abilities.healWithStatusEffect("Heal", "Heal 10 health.", 0, 10, [
        {
          id: "satiated",
          strength: 10,
          duration: 300,
        },
      ]),
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
      Abilities.healWithStatusEffect("Heal", "Heal 20 health.", 0, 20, [
        {
          id: "satiated",
          strength: 20,
          duration: 300,
        },
      ]),
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
      "A necklace made of all things disturbing. Turns physical damage you deal into psychic damage and increases your damage by 1.",
    getWeight: 0.5,
    getSellValue: 15,
    getDamageToDeal: (creature, source, damage) =>
      damage.map((d) => ({
        amount: d.amount + 1,
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
        1.6,
        [{ amount: 8, type: DamageType.Piercing }]
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
        { amount: 9, type: DamageType.Piercing },
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
        { amount: 11, type: DamageType.Bludgeoning },
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
        [{ amount: 5, type: DamageType.Piercing }]
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
        [{ amount: 5, type: DamageType.Slashing }]
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
        [{ amount: 3, type: DamageType.Piercing }]
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
  skeletalSword: {
    getName: "Skeletal Sword",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A long, bony blade.",
    getWeight: 4,
    getSellValue: 20,
    getAbilities: (creature, item) => [
      Abilities.attack("Slash", "A basic slashing attack with a sword.", 1, [
        { amount: 6, type: DamageType.Slashing },
      ]),
    ],
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
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Fireball",
        "Throw a fireball.",
        5,
        [{ amount: 8, type: DamageType.Fire }],
        [
          {
            id: "burning",
            strength: 3,
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
        getCooldown: 3,
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
      Reduces damage you take by 50%, if that damage would otherwise kill you`,
    getWeight: 1,
    getSellValue: 50,
    slot: EquipmentSlot.Head,
    getDamageToTake: (creature, source, damage) =>
      damage.map((d) => ({
        amount: d.amount >= creature.health ? d.amount * 0.5 : d.amount,
        type: d.type,
      })),
  } satisfies EquipmentDefinition,
  hordeFlute: {
    getName: "Horde Flute",
    tags: [ItemTag.Consumable],
    description: "A flute that summons a horde of hostile zombies. Use wisely.",
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
      Adds Poisoned (1) for 1s every second, but increases your intelligence by 5 and all XP gain by 5%.`,
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
      [AbilityScore.Intelligence]: 5,
    },
    getXpToAdd: (player, source, amount) => amount * 1.05,
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
        amount: 4,
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
        3,
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
        amount: 5,
        type: DamageType.Poison,
      },
      {
        amount: 4,
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
  teleportScroll5: teleportScroll(5),
  teleportScroll7: teleportScroll(7),
  teleportScroll9: teleportScroll(9),
  teleportScroll11: teleportScroll(11),
  vine: {
    getName: "Vine",
    description: "A long, twisted vine.",
    getWeight: 0.25,
    getSellValue: 10,
    tags: [],
  },
  livingWood: {
    getName: "Living Wood",
    description: "A large cut of wood. Somehow it still feels alive.",
    getWeight: 0.25,
    getSellValue: 10,
    tags: [],
  },
  hoof: {
    getName: "Hoof",
    description: "The hoof from a horse.",
    getWeight: 0.2,
    getSellValue: 20,
    tags: [],
  },
  horseshoe: {
    getName: "Horseshoe",
    description: "The perfect shoe if you are a horse.",
    getWeight: 0.5,
    getSellValue: 25,
    tags: [],
  },
  livingWoodBow: {
    getName: "Living Wood Bow",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `An ornate bow carved of still living wood. Reduces poison damage by 3.`,
    getWeight: 10,
    getSellValue: 500,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Poison Shot",
        "A powerful, and poisonous, shot.",
        2.5,
        [{ amount: 30, type: DamageType.Piercing }],
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 15, // Duration in seconds
          },
        ]
      ),
    ],
    getDamageResistances: () => [{ amount: 3, type: DamageType.Poison }],
  } satisfies EquipmentDefinition,
  livingWoodLongSword: {
    getName: "Living Wood Long Sword",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `An ornate long sword carved of still living wood. Reduces poison damage by 3.`,
    getWeight: 10,
    getSellValue: 500,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Poison Slash",
        "A powerful, and poisonous, slash.",
        1.2,
        [{ amount: 25, type: DamageType.Slashing }],
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 15, // Duration in seconds
          },
        ]
      ),
    ],
    getDamageResistances: () => [{ amount: 3, type: DamageType.Poison }],
  } satisfies EquipmentDefinition,
  treantSap: {
    getName: "Treant Sap",
    description: "An amber drop of sap from a fallen treant.",
    getWeight: 0.1,
    getSellValue: 25,
    tags: [],
  },
  treantMask: {
    getName: "Treant Mask",
    description:
      "A mask fashioned like a treant face. It's imbued with mystical treant energy.",
    getWeight: 3,
    getSellValue: 100,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    getDamageResistances: () => [
      { amount: 5, type: "*" },
      { amount: 5, type: DamageType.Poison },
      { amount: 2, type: DamageType.Piercing },
      { amount: 2, type: DamageType.Bludgeoning },
      { amount: 2, type: DamageType.Slashing },
    ],
    getDamageBonuses: () => [{ amount: 15, type: DamageType.Bludgeoning }],
  } satisfies EquipmentDefinition,
  amuletOfTheCentaur: {
    getName: "Amulet of the Centaur",
    tags: [ItemTag.Equipment],
    description:
      "This beautiful necklace protects its wearer from the dangers of the forest. Reduces duration of incoming poisoned effect by 20%.",
    getWeight: 1,
    getSellValue: 50,
    getDamageResistances: [
      { amount: 3, type: "*" },
      { amount: 5, type: DamageType.Poison },
    ],
    getStatusEffectDuration: (creature, effect) => {
      if (effect.id === "poisoned") {
        return effect.duration * 0.8;
      }
      return effect.duration;
    },
  } satisfies EquipmentDefinition,
  sequoia: {
    getName: "Sequoia",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `A hefty greatsword made of wood. Capable of healing its user.`,
    getWeight: 10,
    getSellValue: 500,
    getAbilities: (creature, item) => [
      Abilities.attack("Treefall", "This strike is sturdy like a tree.", 1.5, [
        { amount: 40, type: DamageType.Bludgeoning },
      ]),
      Abilities.applyStatusEffect(
        "Block",
        "Reduce damage by 10 for 2 seconds.",
        3,
        [{ id: "blocking", strength: 10, duration: 2 }]
      ),
      Abilities.heal("Regrow", "Recover 10 health.", 2, 10),
    ],
    getDamageResistances: () => [{ amount: 3, type: DamageType.Poison }],
  } satisfies EquipmentDefinition,
  skeletonKey: {
    getName: "Skeleton Key",
    description:
      "A key made from the bones of a skeleton. Must be a lock around here somewhere...",
    getWeight: 0.1,
    getSellValue: 100,
    tags: [ItemTag.Consumable],
  },
  golemCore: {
    getName: "Golem Core",
    description: "A core of a golem, pulsing with energy.",
    getWeight: 5,
    getSellValue: 200,
    tags: [],
  },
  livingStone: {
    getName: "Living Stone",
    description: "A stone that seems to have a heartbeat.",
    getWeight: 4,
    getSellValue: 150,
    tags: [],
  },
  wailingNecklace: {
    getName: "Wailing Necklace",
    description:
      "A necklace that emits a soft wailing sound. Add 2 psychic damage to all attacks.",
    tags: [ItemTag.Equipment],
    getWeight: 0.2,
    getSellValue: 100,
    getDamageToDeal: (creature, source, damage) =>
      damage.concat([
        {
          amount: 2,
          type: DamageType.Psychic,
        },
      ]),
  } satisfies EquipmentDefinition,
  ancientSpirit: {
    getName: "Ancient Spirit",
    description: "A spirit of an ancient being.",
    getWeight: 0.1,
    getSellValue: 200,
    tags: [],
  },
  ancientGreatsword: {
    getName: "Ancient Greatsword",
    description:
      "A greatsword from an ancient civilization. Adds 2 slashing damage to all attacks.",
    getWeight: 3,
    getSellValue: 500,
    tags: [ItemTag.Equipment],
    getDamageToDeal: (creature, source, damage) =>
      damage.concat([
        {
          amount: 2,
          type: DamageType.Slashing,
        },
      ]),
    getAbilities: [
      Abilities.attackWithStatusEffect(
        "Great Slash",
        "A powerful slash with the ancient greatsword.",
        3,
        [{ amount: 20, type: DamageType.Slashing }],
        [
          {
            id: "cursed",
            strength: 2,
            duration: 5,
          },
        ]
      ),
      Abilities.attackWithStatusEffect(
        "Ancient Strike",
        "A strike that channels the power of ancient spirits.",
        4,
        [{ amount: 25, type: DamageType.Slashing }],
        [
          {
            id: "cursed",
            strength: 3,
            duration: 7,
          },
        ]
      ),
      Abilities.summon(
        "Raise Dead",
        "Summons a skeleton to fight for you. Consumes a corpse.",
        5,
        [{ id: "friendlySkeleton", amount: 1 }],
        {
          targetRestrictions: [
            (creature, target) =>
              target instanceof Location &&
              Array.from(target.entities).some(
                (entity) =>
                  entity.name.includes("Corpse") &&
                  entity.definitionId === "container"
              ),
          ],
          onActivate: (creature, targets) => {
            const target = targets[0] as Location;
            const corpses = Array.from(target.entities).filter(
              (entity) =>
                entity.name.includes("Corpse") &&
                entity.definitionId === "container"
            );

            if (corpses.length === 0) {
              getIo().sendMsgToPlayer(
                creature._id.toString(),
                "There are no corpses to raise."
              );
              return false;
            }

            const corpse = corpses[Math.floor(Math.random() * corpses.length)];
            target.entities.delete(corpse);

            const skeleton = new CreatureInstance("skeleton", target.id);
            skeleton.name = "Skeleton";
            target.entities.add(skeleton);

            getIo().sendMsgToPlayer(
              creature._id.toString(),
              `You raise a skeleton from the corpse of ${corpse.name}.`
            );

            return true;
          },
        }
      ),
    ],
  } satisfies EquipmentDefinition,
  ancientBoneNecklace: {
    getName: "Ancient Bone Necklace",
    description:
      "A necklace made from the bones of ancient creatures. Adds 3 slashing damage to all attacks.",
    getWeight: 0.2,
    getSellValue: 300,
    tags: [ItemTag.Equipment],
    getDamageToDeal: (creature, source, damage) =>
      damage.concat([
        {
          amount: 3,
          type: DamageType.Slashing,
        },
      ]),
  } satisfies EquipmentDefinition,
  ashes: {
    getName: "Ashes",
    description: "A handful of ashes from an ancient fire.",
    getWeight: 0.1,
    getSellValue: 50,
    tags: [],
  },
  livingStoneChestplate: {
    getName: "Living Stone Chestplate",
    description: `Armor made from living stone. Provides excellent protection. 
    Reduces all damage taken by 20% and converts piercing and slashing damage to bludgeoning.`,
    getWeight: 5,
    getSellValue: 600,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    getDamageResistances: [{ type: DamageType.Bludgeoning, amount: 4 }],
    getDamageToTake: (creature, source, damage) =>
      damage.map((d) => ({
        amount: d.amount * 0.8, // Reduces damage taken by 20%
        type:
          d.type === DamageType.Piercing || d.type === DamageType.Slashing
            ? DamageType.Bludgeoning
            : d.type,
      })),
  } satisfies EquipmentDefinition,
  rootBoots: {
    getName: "Root Boots",
    tags: [ItemTag.Equipment],
    description: `Boots made from ancient plants creeping into living stone. 
    Increases carrying capacity by 50 kg. Reduces all damage taken by 5 when above 75% health.`,
    getWeight: 2,
    getSellValue: 500,
    slot: EquipmentSlot.Legs,
    getCarryingCapacity: 50,
    getDamageToTake: (creature, source, damage) => {
      if (creature.health > creature.getMaxHealth() * 0.75) {
        return damage.map((d) => ({
          amount: d.amount - 5,
          type: d.type,
        }));
      }
      return damage;
    },
  } satisfies EquipmentDefinition,
  avalancheWarhammer: {
    getName: "Avalanche",
    description: "A heavy warhammer infused with the power of avalanches.",
    getWeight: 3,
    getSellValue: 600,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    getAbilities: [
      Abilities.attackWithStatusEffect(
        "Avalanche Strike",
        "A powerful strike that causes an avalanche of rocks to fall on the target.",
        2,
        [{ amount: 35, type: DamageType.Bludgeoning }],
        [
          {
            id: "stunned",
            strength: 2,
            duration: 15, // Duration in seconds
          },
        ],
        {
          targetCount: 2,
        }
      ),
      Abilities.attackWithStatusEffect(
        "Rockslide",
        "A strike that causes a rockslide, dealing damage to many enemies in the area.",
        2.5,
        [{ amount: 20, type: DamageType.Bludgeoning }],
        [
          {
            id: "stunned",
            strength: 1.5,
            duration: 30, // Duration in seconds
          },
        ],
        {
          targetCount: 3,
        }
      ),
    ],
  } satisfies EquipmentDefinition,
  stoneskinPotion: {
    getName: "Stoneskin Potion",
    description:
      "A potion that grants temporary resistance to physical damage.",
    getWeight: 0.5,
    getSellValue: 150,
    tags: [ItemTag.Consumable],
    getAbilities: [
      Abilities.applyStatusEffect(
        "Drink",
        "Drink the potion to gain stoneskin.",
        0.5,
        [
          {
            id: "stoneskin",
            strength: 7,
            duration: 60, // Duration in seconds
          },
        ],
        {
          targetRestrictions: [CanTarget.isSelf],
        }
      ),
    ],
  } satisfies ConsumableDefinition,
  burnOutScroll: {
    getName: "Burn Out Scroll",
    description: "A scroll that burns out the target's magical energy.",
    getWeight: 0.1,
    getSellValue: 100,
    tags: [ItemTag.Consumable],
    getAbilities: [
      Abilities.applyStatusEffect(
        "Burn Out",
        "Burn out the target's magical energy.",
        0.5,
        [
          {
            id: "burning",
            strength: 1,
            duration: 30, // Duration in seconds
          },
          {
            id: "overcharged",
            strength: 10,
            duration: 30,
          },
        ],
        {
          targetRestrictions: [CanTarget.isSelf],
        }
      ),
    ],
  } satisfies ConsumableDefinition,
  woodlandHorn: {
    getName: "Woodland Horn",
    description: "Summon the forest to your aid.",
    getWeight: 1,
    getSellValue: 15,
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    getAbilities: (creature, item) => [
      Abilities.summon("Call the Forest", "Summon woodland creatures.", 60, [
        { id: "friendlyCentaur", amount: 2 },
        { id: "friendlyTreant", amount: 1 },
      ]),
    ],
  } satisfies EquipmentDefinition,
  taintedSpear: {
    getName: "Tainted Spear",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A spear with a wicked looking point.",
    getWeight: 5,
    getSellValue: 60,
    getAbilities: (creature, item) => [
      Abilities.attack("Stab", "A basic stab attack.", 1, [
        { amount: 12, type: DamageType.Piercing },
      ]),
    ],
  } satisfies EquipmentDefinition,
  hobspear: {
    getName: "Hobspear",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A heavy spear. The handle is covered in metal studs.",
    getWeight: 10,
    getSellValue: 80,
    getAbilities: (creature, item) => [
      Abilities.attack("Stab", "A basic stab attack.", 1.2, [
        { amount: 18, type: DamageType.Piercing },
      ]),
      Abilities.applyStatusEffect(
        "Block",
        "Block 5 damage for 3 seconds.",
        2.5,
        [{ id: "blocking", strength: 5, duration: 3 }]
      ),
    ],
  } satisfies EquipmentDefinition,
  goblinJerkin: {
    getName: "Goblin Jerkin",
    tags: [ItemTag.Equipment],
    description: `A leather jacket offering some protection.`,
    getWeight: 2,
    getSellValue: 100,
    slot: EquipmentSlot.Chest,
    getDamageResistances: [
      { amount: 2, type: "*" },
      { amount: 3, type: DamageType.Bludgeoning },
      { amount: 3, type: DamageType.Piercing },
      { amount: 3, type: DamageType.Slashing },
    ],
  } satisfies EquipmentDefinition,
  goblinHelmet: {
    getName: "Goblin Helmet",
    tags: [ItemTag.Equipment],
    description: `An iron helmet offering some protection.`,
    getWeight: 3,
    getSellValue: 200,
    slot: EquipmentSlot.Head,
    getDamageResistances: [
      { amount: 3, type: "*" },
      { amount: 3, type: DamageType.Bludgeoning },
      { amount: 3, type: DamageType.Piercing },
      { amount: 3, type: DamageType.Slashing },
    ],
  } satisfies EquipmentDefinition,
  goblinScrap: {
    getName: "Goblin Scrap",
    description: "Scrap metal, food, etc.",
    getWeight: 1,
    getSellValue: 25,
    tags: [],
  },
  goblinIdol: {
    getName: "Goblin Idol",
    description: "A miniature statue of a goblin.",
    getWeight: 1,
    getSellValue: 100,
    tags: [],
  },
  firebomb: {
    getName: "Firebomb",
    tags: [ItemTag.Consumable],
    description: `A makeshift firebomb.`,
    getWeight: 1,
    getSellValue: 50,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Firebomb",
        "Creates a fiery explosion.",
        4,
        [{ amount: 20, type: DamageType.Fire }],
        [
          {
            id: "burning",
            strength: 3,
            duration: 5,
          },
        ]
      ),
    ],
  } satisfies ConsumableDefinition,
  dart: {
    getName: "Dart",
    tags: [ItemTag.Consumable],
    description: `A dart.`,
    getWeight: 1,
    getSellValue: 2,
    getAbilities: (creature, item) => [
      Abilities.attack("Dart", "Strike enemies with a blow dart.", 1, [
        { amount: 3, type: DamageType.Piercing },
      ]),
    ],
  } satisfies ConsumableDefinition,
  poisonDart: {
    getName: "Poison Dart",
    tags: [ItemTag.Consumable],
    description: `A dart dipped in spider venom.`,
    getWeight: 1,
    getSellValue: 4,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Poison Dart",
        "Poison enemies with a blow dart.",
        1,
        [{ amount: 5, type: DamageType.Poison }],
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 3,
          },
        ]
      ),
    ],
  } satisfies ConsumableDefinition,
  ember: {
    getName: "Ember",
    tags: [],
    description: `A sole, burning ember.`,
    getWeight: 0.1,
    getSellValue: 50,
  },
  bubbleShroom: {
    getName: "Bubble Shroom",
    tags: [ItemTag.Consumable],
    description: `A shroom that releases a cloud of bubbles.`,
    getWeight: 0.5,
    getSellValue: 30,
    getAbilities: (creature, item) => [
      Abilities.applyStatusEffect("Eat", "Eat the bubble shroom.", 0, [
        { id: "amphibious", strength: 1, duration: 180 },
      ]),
    ],
  } satisfies ConsumableDefinition,
  demonScale: {
    getName: "Demon Scale",
    tags: [],
    description: `A scale from a demon.`,
    getWeight: 0.5,
    getSellValue: 50,
  },
  fortressShell: {
    getName: "Fortress Shell",
    tags: [],
    description: `A sturdy shell that forms the fortress of a bonecrusher crab.`,
    getWeight: 5,
    getSellValue: 100,
  },
  midnightShell: {
    getName: "Midnight Shell",
    tags: [],
    description: `A shell that seems to absorb light, but shimmers like the night sky.`,
    getWeight: 5,
    getSellValue: 100,
  },
  hordeShell: {
    getName: "Horde Shell",
    tags: [],
    description: `A shell that seems to be made of many smaller shells, fused together.`,
    getWeight: 5,
    getSellValue: 100,
  },
  shellHorn: {
    getName: "Shell Horn of the Deep",
    tags: [ItemTag.Consumable],
    description: `A horn made from a shell.`,
    getWeight: 15,
    getSellValue: 500,
    getAbilities: (creature) =>
      "floor" in locations[creature.location] &&
      (locations[creature.location] as DungeonLocation).floor.definition
        .name === "Flooded Caves"
        ? [
            Abilities.summon(
              "Call Kraken",
              "Blow into the shell, beckoning a kraken from the depths.",
              0,
              [
                {
                  id: "kraken",
                  amount: 1,
                },
              ]
            ),
          ]
        : [],
  } satisfies ConsumableDefinition,
  enchantingSpirit: {
    getName: "Enchanting Spirit",
    tags: [],
    description: `A spirit that enchants those around it.`,
    getWeight: 0.1,
    getSellValue: 75,
  },
  ink: {
    getName: "Ink",
    tags: [],
    description: `A vial of black ink.`,
    getWeight: 0.1,
    getSellValue: 5,
  },
  krakenShellFragment: {
    getName: "Kraken Shell Fragment",
    tags: [],
    description: `A fragment of a kraken's shell, imbued with magical properties.`,
    getWeight: 3,
    getSellValue: 50,
  },
  krakenClawAxe: {
    getName: "Kraken Claw",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `An axe made from the claw of a kraken. It crackles with energy.`,
    getWeight: 10,
    getSellValue: 600,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Kraken Slash",
        "A powerful slash that channels the energy of the kraken.",
        3,
        [{ amount: 40, type: DamageType.Slashing }],
        [
          {
            id: "stunned",
            strength: 2,
            duration: 5,
          },
        ]
      ),
      Abilities.attackWithStatusEffect(
        "Kraken's Grasp",
        "A strike that ensnares the target, dealing damage and applying a stun.",
        4,
        [{ amount: 30, type: DamageType.Slashing }],
        [
          {
            id: "stunned",
            strength: 2,
            duration: 5,
          },
          {
            id: "cursed",
            strength: 3,
            duration: 5,
          },
          {
            id: "poisoned",
            strength: 2,
            duration: 5,
          },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  krakenToothDagger: {
    getName: "Kraken Tooth",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `A dagger made from the tooth of a kraken. It glows with a faint light.`,
    getWeight: 2,
    getSellValue: 600,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Kraken's Bite",
        "A quick slash that channels the energy of the kraken.",
        1.5,
        [{ amount: 25, type: DamageType.Piercing }],
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 5,
          },
        ]
      ),
      Abilities.attackWithStatusEffect(
        "Kraken's Sting",
        "A strike that channels the energy of the kraken, dealing damage and applying a curse.",
        2.5,
        [{ amount: 20, type: DamageType.Piercing }],
        [
          {
            id: "cursed",
            strength: 2,
            duration: 5,
          },
          {
            id: "poisoned",
            strength: 2,
            duration: 5,
          },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  krakenEyeNecklace: {
    getName: "Kraken Eye Necklace",
    tags: [ItemTag.Equipment],
    description: `A necklace made from the eye of a kraken. Grants immunity to the cursed, poisoned, and suffocating effects.`,
    getWeight: 0.5,
    getSellValue: 600,
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "cursed" ||
      effect.id === "poisoned" ||
      effect.id === "suffocating"
        ? undefined
        : effect,
  } satisfies EquipmentDefinition,
  enrapturingRing: {
    getName: "Enrapturing Ring",
    tags: [ItemTag.Equipment],
    description: `A ring that enchants those around it, inflicting the stunned effect when you hit them.`,
    getWeight: 0.1,
    getSellValue: 300,
    onAttack: (creature, target, source, damage) => {
      target.addStatusEffect({
        id: "stunned",
        strength: creature.scaleAbility(2),
        duration: creature.scaleAbility(3),
      });
    },
  } satisfies EquipmentDefinition,
  scaleChestplate: {
    getName: "Demonic Scaleplate",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    description: `A chestplate made from demon scales. 
      Provides excellent protection against physical damage and reduces the duration of curse effects on you by half.`,
    getWeight: 5,
    getSellValue: 400,
    getDamageResistances: () => [
      { amount: 10, type: DamageType.Piercing },
      { amount: 8, type: DamageType.Slashing },
      { amount: 8, type: DamageType.Bludgeoning },
      { amount: 4, type: "*" },
    ],
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "cursed"
        ? {
            ...effect,
            duration: effect.duration / 2, // Halve the duration of curse effects
          }
        : effect,
  } satisfies EquipmentDefinition,
  chitinLeggings: {
    getName: "Chitin Leggings",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Legs,
    description: `A heavy pair of leggings made from crab shells.`,
    getWeight: 8,
    getSellValue: 400,
    getDamageResistances: () => [
      { amount: 6, type: DamageType.Piercing },
      { amount: 6, type: DamageType.Slashing },
      { amount: 6, type: DamageType.Bludgeoning },
      { amount: 4, type: "*" },
    ],
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "cursed"
        ? {
            ...effect,
            duration: effect.duration / 2, // Halve the duration of curse effects
          }
        : effect,
  } satisfies EquipmentDefinition,
  chitinChestplate: {
    getName: "Chitin Chestplate",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    description: `A heavy chestplate made from crab shells.`,
    getWeight: 10,
    getSellValue: 400,
    getDamageResistances: () => [
      { amount: 6, type: DamageType.Piercing },
      { amount: 6, type: DamageType.Slashing },
      { amount: 6, type: DamageType.Bludgeoning },
      { amount: 4, type: "*" },
    ],
  } satisfies EquipmentDefinition,
  chitinHelmet: {
    getName: "Chitin Helmet",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    description: `A heavy helmet made from crab shells.`,
    getWeight: 8,
    getSellValue: 400,
    getDamageResistances: () => [
      { amount: 6, type: DamageType.Piercing },
      { amount: 6, type: DamageType.Slashing },
      { amount: 6, type: DamageType.Bludgeoning },
      { amount: 4, type: "*" },
    ],
  } satisfies EquipmentDefinition,
  squidHelmet: {
    getName: "Squid Helmet",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    description: `A helmet made from the shell of a squid. 
      Provides excellent protection against physical damage.`,
    getWeight: 3,
    getSellValue: 300,
    getDamageResistances: () => [
      { amount: 8, type: DamageType.Piercing },
      { amount: 8, type: DamageType.Slashing },
      { amount: 8, type: DamageType.Bludgeoning },
      { amount: 3, type: "*" },
    ],
    getAbilities: (creature, item) => [
      Abilities.applyStatusEffect(
        "Ink Cloud",
        "Release a cloud of ink, obscuring vision and slowing enemies.",
        2,
        [
          {
            id: "stunned",
            strength: 3,
            duration: 5,
          },
        ],
        {
          targetCount: 2,
        }
      ),
      Abilities.applyStatusEffect("Ink Spray", "Spray ink at enemies.", 1, [
        {
          id: "stunned",
          strength: 2,
          duration: 3,
        },
      ]),
    ],
  } satisfies EquipmentDefinition,
  implantableGills: {
    getName: "Implantable Gills",
    tags: [ItemTag.Equipment],
    description: `A set of gills that can be implanted into a creature. Applies the amphibious status effect.`,
    getWeight: 0.5,
    getSellValue: 500,
    tick: (creature, deltatime, source) => {
      if (
        !creature.statusEffects.some((s) => s.definitionId === "amphibious")
      ) {
        creature.addStatusEffect({
          id: "amphibious",
          strength: 1,
          duration: deltatime,
        });
      }
    },
  } satisfies EquipmentDefinition,
  pocketGolem: {
    getName: "Pocket Golem",
    tags: [ItemTag.Consumable],
    description: `Disclaimer: Does not actually fit in your pocket.`,
    getWeight: 25,
    getSellValue: 300,
    getAbilities: (creature, item) => [
      Abilities.summon("Summon Golem", "Summon a golem to fight for you.", 10, [
        { id: "friendlyGolem", amount: 1 },
      ]),
    ],
  } satisfies ConsumableDefinition,
  ice: {
    getName: "Ice",
    tags: [],
    description: "A glistening shard of ice.",
    getWeight: 0.5,
    getSellValue: 50,
  },
  yetiFur: {
    getName: "Yeti Fur",
    tags: [],
    description: "This pure white fur is very soft and warm.",
    getWeight: 0.5,
    getSellValue: 100,
  },
  frozenCrystal: {
    getName: "Frozen Crystal",
    tags: [],
    description: "An intricate and beautiful blue crystal.",
    getWeight: 0.2,
    getSellValue: 500,
  },
  giantTooth: {
    getName: "Giant Tooth",
    tags: [],
    description: "This tooth is the size of your head.",
    getWeight: 1,
    getSellValue: 200,
  },
  blizzard: {
    getName: "Blizzard",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `A giant club. It feels cold to hold.`,
    getWeight: 20,
    getSellValue: 1000,
    getAbilities: (creature, item) => [
      Abilities.attack("Giant Blow", "Strike for heavy damage.", 2, [
        { amount: 65, type: DamageType.Bludgeoning },
        { amount: 15, type: DamageType.Cold },
      ]),
      Abilities.applyStatusEffect(
        "Freeze",
        "Freeze target for 5 seconds, increasing cooldowns.",
        4,
        [{ id: "frozen", strength: 20, duration: 5 }]
      ),
    ],
  } satisfies EquipmentDefinition,
  wintersBreath: {
    getName: "Winter's Breath",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `A lightweight sword made of freezing steel.`,
    getWeight: 10,
    getSellValue: 1250,
    getAbilities: (creature, item) => [
      Abilities.attackWithStatusEffect(
        "Winter's Strike",
        "A freezing cold strike.",
        0.8,
        [{ amount: 40, type: DamageType.Piercing }],
        [{ id: "frozen", strength: 30, duration: 0.6 }]
      ),
      Abilities.applyStatusEffectLocation(
        "Winter's Cloak",
        "Protect allies in your location.",
        0.8,
        [{ id: "frozen", strength: 30, duration: 0.6 }],
        true,
        false
      ),
    ],
  } satisfies EquipmentDefinition,
  mammoth: {
    getName: "Mammoth",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `A massive shield of ice.`,
    getWeight: 20,
    getSellValue: 1000,
    getAbilities: (creature, item) => [
      Abilities.applyStatusEffect(
        "Ice Wall",
        "Block significant damage for 5 seconds.",
        30,
        [{ id: "blocking", strength: 20, duration: 5 }]
      ),
    ],
    getDamageResistances: [{ amount: 10, type: "*" }],
  } satisfies EquipmentDefinition,
  frozenChain: {
    getName: "Frozen Chain",
    tags: [ItemTag.Equipment],
    description: `A chain made of ice. Protects the wearer from cold and freezing. Halves the strength and duration of the frozen effect.`,
    getWeight: 1,
    getSellValue: 700,
    getDamageResistances: [
      { amount: 10, type: DamageType.Cold },
      { amount: 2, type: "*" },
    ],
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "frozen"
        ? {
            id: effect.id,
            strength: effect.strength / 2,
            duration: effect.duration / 2,
          }
        : effect,
  } satisfies EquipmentDefinition,
  giantCrown: {
    getName: "Giant Crown",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    description: `A crown of giant teeth. Boosts damage.`,
    getWeight: 4,
    getSellValue: 1000,
    getDamageResistances: [
      { amount: 20, type: "*" },
      { amount: 30, type: DamageType.Cold },
    ],
    getDamageBonuses: [{ amount: 10, type: "*" }],
    getAbilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 5,
    },
  } satisfies EquipmentDefinition,
  glacier: {
    getName: "Glacier",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    description: `A bulky chestplate made of ice.`,
    getWeight: 12,
    getSellValue: 3000,
    getDamageResistances: [
      { amount: 30, type: "*" },
      { amount: 50, type: DamageType.Cold },
    ],
  } satisfies EquipmentDefinition,
  yetiBoots: {
    getName: "Yeti Boots",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Legs,
    description: `A comfortable pair of boots for traversing cold weather.`,
    getWeight: 4,
    getSellValue: 800,
    getDamageResistances: [
      { amount: 20, type: DamageType.Cold },
      { amount: 5, type: "*" },
    ],
    getAbilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 0,
    },
  } satisfies EquipmentDefinition,
  yetiSkull: {
    getName: "Yeti Skull",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    description: `A large skull from a yeti. Prized by hunters.`,
    getWeight: 6,
    getSellValue: 400,
    getDamageResistances: [
      { amount: 20, type: DamageType.Cold },
      { amount: 10, type: "*" },
    ],
    getAbilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 10,
    },
  } satisfies EquipmentDefinition,
  yetiHead: {
    getName: "Yeti Head",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    description: `A yeti head. Something about it looks a bit off...`,
    getWeight: 8,
    getSellValue: 650,
    getDamageResistances: [
      { amount: 30, type: DamageType.Cold },
      { amount: 15, type: "*" },
    ],
    getDamageBonuses: [{ amount: 5, type: DamageType.Psychic }],
    getAbilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 15,
    },
  } satisfies EquipmentDefinition,
  volcanicAmulet: {
    getName: "Volcanic Amulet",
    tags: [ItemTag.Equipment],
    description: `An amulet that protects its wearer from fire and lava. 
      Reduces fire damage taken by 10 and halves the duration and strength of burning effects.`,
    getWeight: 0.5,
    getSellValue: 1000,
    getDamageResistances: [
      { amount: 10, type: DamageType.Fire },
      { amount: 3, type: "*" },
    ],
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "burning"
        ? {
            id: effect.id,
            strength: effect.strength / 2,
            duration: effect.duration / 2,
          }
        : effect,
  } satisfies EquipmentDefinition,
  magmaSlimeEgg: {
    getName: "Magma Slime Egg",
    tags: [],
    description: `A pulsating sac of magma slime.`,
    getWeight: 5,
    getSellValue: 500,
  },
  volcanicOmelet: {
    getName: "Volcanic Omelet",
    tags: [ItemTag.Consumable],
    description: `A spicy omelet made from a magma slime egg. Applies fire immunity for 300s.`,
    getWeight: 1,
    getSellValue: 500,
    getAbilities: [
      Abilities.applyStatusEffect(
        "Eat",
        "Eat the volcanic omelet.",
        0,
        [
          {
            id: "fireImmune",
            strength: 1,
            duration: 300, // Duration in seconds
          },
        ],
        {
          targetRestrictions: [CanTarget.isSelf],
        }
      ),
    ],
  } satisfies ConsumableDefinition,
  dragonScale: {
    getName: "Dragon Scale",
    tags: [],
    description: `A scale from a dragon.`,
    getWeight: 2,
    getSellValue: 1000,
  },
  wyvernHeart: {
    getName: "Wyvern Heart",
    tags: [],
    description: `The still-beating heart of a wyvern.`,
    getWeight: 15,
    getSellValue: 2000,
  },
  dragonHead: {
    getName: "Dragon Head",
    tags: [],
    description: `The severed head of a dragon.`,
    getWeight: 50,
    getSellValue: 5000,
  },
  beastScaleArmor: {
    getName: "Beast Scalemail",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    description: `Armor made from dragon and demon scales, reinforced with kraken shells.`,
    getWeight: 8,
    getSellValue: 5000,
    getDamageResistances: [
      { amount: 15, type: "*" },
      { amount: 25, type: DamageType.Fire },
      { amount: 25, type: DamageType.Poison },
    ],
    getDamageBonuses: [
      { amount: 10, type: DamageType.Slashing },
      { amount: 10, type: DamageType.Piercing },
      { amount: 10, type: DamageType.Bludgeoning },
    ],
    getAbilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 15,
    },
    onAttack: (creature, target, source, damage) => {
      target.addStatusEffect({
        id: "cursed",
        strength: creature.scaleAbility(5),
        duration: creature.scaleAbility(5),
      });
    },
  } satisfies EquipmentDefinition,
  flamebane: {
    getName: "Flamebane",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: `A sword that burns with an icy flame.`,
    getWeight: 12,
    getSellValue: 3000,
    getAbilities: [
      Abilities.applyStatusEffect(
        "Freeze/Burn",
        "Freeze and burn the target for 10 seconds.",
        4,
        [
          { id: "frozen", strength: 20, duration: 10 },
          { id: "burning", strength: 5, duration: 10 },
        ]
      ),
      Abilities.attack("Icy Thrust", "A piercing thrust of icy energy.", 1.5, [
        { amount: 40, type: DamageType.Piercing },
        { amount: 15, type: DamageType.Cold },
      ]),
      Abilities.attack(
        "Flame Slash",
        "A slashing attack of fiery energy.",
        1.5,
        [
          { amount: 40, type: DamageType.Slashing },
          { amount: 15, type: DamageType.Fire },
        ]
      ),
    ],
  } satisfies EquipmentDefinition,
  dragonfireRing: {
    getName: "Dragonfire Ring",
    tags: [ItemTag.Equipment],
    description: `A ring that enhances fire spells.`,
    getWeight: 0.1,
    getSellValue: 1500,
    getAbilityScores: {
      [AbilityScore.Intelligence]: 5,
    },
    getDamageBonuses: [{ amount: 5, type: DamageType.Fire }],
    getAbilities: [
      Abilities.attackWithStatusEffect(
        "Fireball",
        "Unleash a powerful fireball.",
        10,
        [{ amount: 50, type: DamageType.Fire }],
        [{ id: "burning", strength: 10, duration: 5 }]
      ),
    ],
  } satisfies EquipmentDefinition,
  wingedBackpack: {
    getName: "Winged Backpack",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Back,
    description: `A backpack with wings that hold it aloft.`,
    getWeight: 0,
    getSellValue: 2000,
    getCarryingCapacity: 250,
  } satisfies EquipmentDefinition,
  vengefulRing: {
    getName: "Vengeful Ring",
    tags: [ItemTag.Equipment],
    description: "Applies Overcharged (2) for 5s whenever you heal.",
    getWeight: 0.1,
    getSellValue: 150,
    onHeal: (creature, source, healAmount) => {
      creature.addStatusEffect({
        id: "overcharged",
        strength: creature.scaleAbility(2),
        duration: creature.scaleAbility(5),
      });
    },
  } satisfies EquipmentDefinition,
  drainingRing: {
    getName: "Draining Ring",
    tags: [ItemTag.Equipment],
    description:
      "Applies Overcharged (3) for 10s to you and Cursed (2) for 5s to everyone else in your location whenever you heal.",
    getWeight: 0.1,
    getSellValue: 450,
    onHeal: (creature, source, healAmount) => {
      creature.addStatusEffect({
        id: "overcharged",
        strength: creature.scaleAbility(3),
        duration: creature.scaleAbility(10),
      });

      const location = locations[creature.location];
      for (const entity of Array.from(location.entities)) {
        if (entity instanceof CreatureInstance && entity._id !== creature._id) {
          entity.addStatusEffect({
            id: "cursed",
            strength: creature.scaleAbility(2),
            duration: creature.scaleAbility(5),
          });
        }
      }
    },
  } satisfies EquipmentDefinition,
  healthfulAmulet: {
    getName: "Healthful Amulet",
    tags: [ItemTag.Equipment],
    description:
      "Whenever you heal, heal extra health equal to half your intelligence. Increases your intelligence by 2.",
    getWeight: 0.1,
    getSellValue: 200,
    getAbilityScores: {
      [AbilityScore.Intelligence]: 2,
    },
    getAmountToHeal: (creature, source, healAmount) =>
      healAmount +
      Math.floor(creature.getAbilityScore(AbilityScore.Intelligence) / 2),
  } satisfies EquipmentDefinition,
  horrifyingBow: {
    getName: "Horrifying Bow",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Hands,
    description: "A disgusting bow made of undead materials.",
    getWeight: 5,
    getSellValue: 100,
    getAbilities: (creature, item) => [
      Abilities.attack("Shoot", "A powerful, though disgusting, bow shot.", 2, [
        { amount: 18, type: DamageType.Piercing },
      ]),
    ],
  } satisfies EquipmentDefinition,
  undeadChestplate: {
    getName: "Undead Chestplate",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Chest,
    description: `A chesplate made from the remains of the undead. Reduces the duration of the cursed status effect by 25% for you.`,
    getWeight: 16,
    getSellValue: 100,
    getDamageResistances: [{ amount: 3, type: "*" }],
    getAbilityScores: {
      [AbilityScore.Strength]: 2,
    },
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "cursed"
        ? {
            ...effect,
            duration: effect.duration * 0.75,
          }
        : effect,
  } satisfies EquipmentDefinition,
  undeadHelmet: {
    getName: "Undead Helmet",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Head,
    description: `A helmet made from the remains of the undead. Reduces the duration of the cursed status effect by 25% for you.`,
    getWeight: 8,
    getSellValue: 100,
    getDamageResistances: [{ amount: 3, type: "*" }],
    getAbilityScores: {
      [AbilityScore.Strength]: 2,
    },
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "cursed"
        ? {
            ...effect,
            duration: effect.duration * 0.75,
          }
        : effect,
  } satisfies EquipmentDefinition,
  undeadBoots: {
    getName: "Undead Boots",
    tags: [ItemTag.Equipment],
    slot: EquipmentSlot.Legs,
    description: `A pair of boots made from the remains of the undead. Reduces the duration of the cursed status effect by 25% for you.`,
    getWeight: 10,
    getSellValue: 100,
    getDamageResistances: [{ amount: 3, type: "*" }],
    getAbilityScores: {
      [AbilityScore.Strength]: 2,
    },
    getStatusEffectToApply: (creature, effect) =>
      effect.id === "cursed"
        ? {
            ...effect,
            duration: effect.duration * 0.75,
          }
        : effect,
  } satisfies EquipmentDefinition,
  discountToken: {
    getName: "Discount Token",
    tags: [],
    description: "A token that grants a 20% discount on shop prices.",
    getWeight: 0,
    getSellValue: 3000,
  },
  sirensTrident: {
    getName: "Siren's Trident",
    tags: [ItemTag.Equipment],
    description: "A sleek trident that emanates a soft wail.",
    getWeight: 4,
    getSellValue: 200,
    getAbilities: (creature, item) => [
      Abilities.attack(
        "Psychic Pierce",
        "A piercing attack dealing psychic damage.",
        1,
        [
          { amount: 15, type: DamageType.Piercing },
          { amount: 10, type: DamageType.Psychic },
        ]
      ),
      Abilities.attackWithStatusEffect(
        "Stunning Strike",
        "Stun enemies briefly.",
        1.5,
        [{ amount: 20, type: DamageType.Piercing }],
        [{ id: "stunned", strength: 5, duration: 2 }]
      ),
    ],
    slot: EquipmentSlot.Hands,
  } satisfies EquipmentDefinition,
} satisfies Record<ItemId, ItemDefinition | EquipmentDefinition | ConsumableDefinition>);

export default items;
