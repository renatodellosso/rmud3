import { WeightedTable } from "lib/types/WeightedTable";
import { LootTable } from "lib/types/LootTable";
import AbilityScore, {
  BONUS_FROM_INTELLIGENCE,
  BONUS_FROM_STRENGTH,
} from "lib/types/AbilityScore";
import {
  CreatureDefinition,
  CreatureInstance,
} from "../types/entities/creature";
import * as Abilities from "lib/gamedata/Abilities";
import * as CanTarget from "lib/gamedata/CanTarget";
import {
  activateAbilityAndMoveRandomlyOnTick,
  activateAbilityOnTick,
  selectRandomAbility,
} from "lib/entityutils";
import { EntityDefinition, Interaction } from "lib/types/entity";
import items, { ItemId } from "./items";
import { getIo } from "lib/ClientFriendlyIo";
import craftingInteraction from "./interactions/craftingInteraction";
import Recipe, { RecipeGroup } from "lib/types/Recipe";
import { ContainerInstance } from "lib/types/entities/container";
import inventoryInteraction from "./interactions/inventoryInteraction";
import { savePlayer } from "lib/utils";
import { getFromOptionalFunc } from "../utils";
import { vaultLevelling } from "lib/types/Vault";
import Guild from "lib/types/Guild";
import { ItemInstance } from "lib/types/item";
import locations from "lib/locations";
import reforgeInteraction from "./interactions/reforgeInteraction";
import { DamageType } from "lib/types/Damage";
import { Location } from "lib/types/Location";
import shopInteraction from "./interactions/shopInteraction";
import statusEffects, { StatusEffectId } from "./statusEffects";
import { StatusEffectInstance } from "lib/types/statuseffect";
import reforges from "./Reforges";

// Prefix summons with friendly

export type CreatureId =
  | "player"
  | "trainingDummy"
  | "zombie"
  | "zombieHordling"
  | "skeleton"
  | "scavengingGoblin"
  | "caveCrawler"
  | "caveCrawlerVenomous"
  | "caveCrawlerScaled"
  | "slime"
  | "slimeSplitter"
  | "slimePoisoner"
  | "bigSlime"
  | "lurkingTendril"
  | "ogre"
  | "troll"
  | "trollRat"
  | "fungalZombie"
  | "fungalTroll"
  | "sentientFungus"
  | "fungalCore"
  | "farulu"
  | "lostAdventurer"
  | "goblin"
  | "hobgoblin"
  | "goblinShaman"
  | "masterGoblinShaman"
  | "goblinWarrior"
  | "hobgoblinWarrior"
  | "goblinInventor"
  | "ghost"
  | "cursedGhost"
  | "wraith"
  | "rat"
  | "giantRat"
  | "plagueRat"
  | "saltGolem"
  | "spider"
  | "spiderSpitter"
  | "ancientTroll"
  | "friendlySlime"
  | "overgrownGolem"
  | "writhingVines"
  | "viper"
  | "centaur"
  | "friendlyCentaur"
  | "treant"
  | "elderTreant"
  | "friendlyTreant"
  | "skeletonWarrior"
  | "skeletonBonecaller"
  | "cryptGuardGolem"
  | "livingStatue"
  | "banshee"
  | "skeletonHero"
  | "friendlySkeleton"
  | "piranha"
  | "siren"
  | "giantSquid"
  | "bonecrusherCrab"
  | "octoCrab"
  | "hordecallerCrab"
  | "kraken"
  | "friendlyGolem"
  | "yeti"
  | "iceGolem"
  | "frostElemental"
  | "frostGiant"
  | "wight"
  | "magmaElemental"
  | "volcanoSpirit"
  | "magmaSlime"
  | "wyvern"
  | "animatedLavaFlow"
  | "dragon";

export type EntityId =
  | CreatureId
  | "container"
  | "signPost"
  | "anvil"
  | "furnace"
  | "workbench"
  | "mystic"
  | "tavernKeeper"
  | "junkCollector"
  | "trader"
  | "banker"
  | "vault"
  | "instructor"
  | "menhir"
  | "reforgeAnvil"
  | "lockedCoffin";

const creatures: Record<CreatureId, CreatureDefinition> = {
  player: {
    name: "Player",
    health: 40,
    xpValue: 0,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
  } as CreatureDefinition,
  trainingDummy: {
    name: "Training Dummy",
    health: 1000000000,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      {
        name: "Taunt",
        getDescription: () => "Taunts all enemies in the room.",
        getCooldown: () => 0.5,
        getTargetCount: () => 0,
        canTarget: () => false,
        activate: (creature) => {
          getIo().sendMsgToRoom(
            creature.location,
            `${creature.name} taunts everyone in the room!`
          );
          return true;
        },
      },
      Abilities.attack(
        "Slap",
        "Slap an enemy.",
        0.5,
        [
          {
            amount: 2,
            type: DamageType.Slashing,
          },
          {
            amount: 2,
            type: DamageType.Piercing,
          },
          {
            amount: 2,
            type: DamageType.Bludgeoning,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 100,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "certificateOfAchievement",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: (creature, delta) =>
      activateAbilityOnTick(
        creature as CreatureInstance,
        delta,
        selectRandomAbility
      ),
  },
  zombie: {
    name: "Zombie",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "Bite an enemy.",
        3,
        [{ amount: 1, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "rottenFlesh",
            amount: [1, 2],
            weight: 1.2,
          },
          {
            item: "eyeball",
            amount: [0, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },

  zombieHordling: {
    name: "Zombie Hordling",
    health: 5,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "Bite an enemy.",
        5,
        [{ amount: 2, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 10,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "rottenFlesh",
            amount: 1,
            weight: 1.2,
          },
          {
            item: "eyeball",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  skeleton: {
    name: "Skeleton",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 4,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 1,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slash",
        "Slash an enemy with a bone sword.",
        4,
        [{ amount: 1, type: DamageType.Slashing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 10,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bone",
            amount: [1, 4],
            weight: 1,
          },
          {
            item: "skull",
            amount: 1,
            weight: 0.2,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },

  scavengingGoblin: {
    name: "Scavenging Goblin",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 3,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Spear",
        "Are these descriptions even displayed anywhere?",
        3,
        [{ amount: 5, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Block",
        "Block an attack.",
        2,
        [
          {
            id: "blocking",
            strength: 15,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [5, 9],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bottle",
            amount: 1,
            weight: 1,
          },
          {
            item: "mushroom",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "leather",
            amount: 1,
            weight: 1,
          },
          {
            item: "rope",
            amount: [2, 3],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  caveCrawler: {
    name: "Cave Crawler",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Piercing }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Bite",
        "Bite an enemy.",
        2,
        [{ amount: 2, type: DamageType.Piercing }],
        [
          {
            id: "cursed",
            strength: 1,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 10,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bone",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "leather",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
  },
  caveCrawlerVenomous: {
    name: "Venomous Cave Crawler",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [
      { amount: 1, type: DamageType.Piercing },
      { amount: 1, type: DamageType.Poison },
    ],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Venomous Bite",
        "Bite an enemy with venom.",
        3,
        [{ amount: 3, type: DamageType.Piercing }],
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bone",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "leather",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "venom",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
  },
  caveCrawlerScaled: {
    name: "Scaled Cave Crawler",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 3, type: "*" }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Bite",
        "Bite an enemy.",
        3,
        [{ amount: 2, type: DamageType.Piercing }],
        [
          {
            id: "cursed",
            strength: 1,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 10,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bone",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "leather",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "ironOre",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
  },
  slime: {
    name: "Slime",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attack(
        "Slime",
        "Slime.",
        4,
        [{ amount: 1, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 5,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slime",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ironOre",
            amount: [1, 2],
            weight: 0.5,
          },
          {
            item: "coal",
            amount: [1, 2],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  slimeSplitter: {
    name: "Splitter Slime",
    health: 35,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attack(
        "Slime",
        "Slime.",
        4,
        [{ amount: 1, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Infest",
        "Infest an enemy with slime.",
        2,
        [
          {
            id: "infested",
            strength: 7,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slime",
            amount: [3, 6],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slimeEgg",
            amount: [1, 3],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
    onDie: (creature) => {
      const location = locations[creature.location];

      for (let i = 0; i < 3; i++) {
        location.entities.add(new CreatureInstance("slime", creature.location));
      }

      const io = getIo();
      io.sendMsgToRoom(
        creature.location,
        `${creature.name} splits into 3 smaller slimes!`
      );
      io.updateGameStateForRoom(creature.location);
    },
  },
  slimePoisoner: {
    name: "Poison Slime",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 3, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Poison Slime",
        "A poisonous slime attack.",
        4,
        [{ amount: 2, type: DamageType.Poison }],
        [
          {
            id: "poisoned",
            strength: 5,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Poison Cloud",
        "Creates a cloud of poison.",
        3,
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 20,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slime",
            amount: [2, 5],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ironOre",
            amount: [1, 3],
            weight: 0.5,
          },
          {
            item: "coal",
            amount: [1, 3],
            weight: 0.5,
          },
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
  },
  bigSlime: {
    name: "Big Slime",
    health: 40,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Poison }],

    intrinsicAbilities: [
      Abilities.attack(
        "Slime",
        "Slime.",
        3,
        [{ amount: 3, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slime",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ironOre",
            amount: [1, 2],
            weight: 0.5,
          },
          {
            item: "coal",
            amount: [1, 2],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  lurkingTendril: {
    name: "Lurking Tendril",
    health: 30,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [{ amount: 2, type: DamageType.Bludgeoning }],
    intrinsicAbilities: [
      Abilities.attack(
        "Tentacle Strike",
        "A swift strike with a tentacle.",
        4,
        [{ amount: 4, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Grapple",
        "Attempts to grapple a target.",
        3,
        [
          {
            amount: 4,
            type: DamageType.Bludgeoning,
          },
        ],
        [
          {
            id: "stunned",
            strength: 2,
            duration: 2,
          },
        ],
        {
          targetRestrictions: [CanTarget.isAlly],
        }
      ),
    ],
    xpValue: 30,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slime",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },

  ogre: {
    name: "Ogre",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 8,
      [AbilityScore.Constitution]: 3,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slam.",
        4,
        [{ amount: 5, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Roar",
        "Let out a fearsome roar.",
        1.5,
        [
          {
            id: "overcharged",
            strength: 2,
            duration: 15,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 25,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "taintedFlesh",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "trollTooth",
            amount: [1, 2],
            weight: 1.2,
          },
          {
            item: "trollHeart",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "furyBelt",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.3,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  troll: {
    name: "Troll",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [
      { amount: 1, type: DamageType.Bludgeoning },
      { amount: 1, type: DamageType.Piercing },
      { amount: 1, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slam.",
        6,
        [{ amount: 5, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.heal("Heal", "Recover a small amount of health.", 10, 5, {
        targetRestrictions: [CanTarget.isSelf],
      }),
    ],
    xpValue: 25,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "taintedFlesh",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "trollTooth",
            amount: [1, 2],
            weight: 1.2,
          },
          {
            item: "trollHeart",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ironOre",
            amount: [1, 5],
            weight: 1,
          },
          {
            item: "coal",
            amount: [1, 5],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 0.6,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },

  giantRat: {
    name: "Giant Rat",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "The rat snacks on you.",
        4,
        [{ amount: 4, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 10,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ratTail",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.5,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },

  saltGolem: {
    name: "Salt Golem",
    health: 35,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [{ amount: 2, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Slam",
        "Slam.",
        5,
        [{ amount: 5, type: DamageType.Bludgeoning }],
        [
          {
            id: "poisoned",
            strength: 2,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Salt Poison",
        "Inflict salt poison on an enemy.",
        3,
        [
          {
            id: "poisoned",
            strength: 5,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 25,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "carvingStone",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.2,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "salt",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  fungalZombie: {
    name: "Fungal Zombie",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 4,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "Bite an enemy.",
        3,
        [{ amount: 3, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 20,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "mushroom",
            amount: [1, 2],
            weight: 1.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "rottenFlesh",
            amount: [1, 2],
            weight: 1.2,
          },
          {
            item: "eyeball",
            amount: [0, 2],
            weight: 1,
          },
          {
            item: "spore",
            amount: [1, 3],
            weight: 1.5,
          },
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  fungalTroll: {
    name: "Fungal Troll",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 7,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [
      { amount: 1, type: DamageType.Bludgeoning },
      { amount: 1, type: DamageType.Piercing },
      { amount: 1, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slam.",
        5,
        [{ amount: 8, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.heal("Heal", "Recover a small amount of health.", 10, 8, {
        targetRestrictions: [CanTarget.isSelf],
      }),
    ],
    xpValue: 30,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "mushroom",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "spore",
            amount: [1, 3],
            weight: 1.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "taintedFlesh",
            amount: [1, 2],
            weight: 1.2,
          },
          {
            item: "trollTooth",
            amount: [0, 2],
            weight: 1,
          },
          {
            item: "trollHeart",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  sentientFungus: {
    name: "Sentient Fungus",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Spore Injection",
        "Infest an enemy with spores.",
        4,
        [{ amount: 4, type: DamageType.Piercing }],
        [
          {
            id: "infested",
            strength: 5,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 25,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "mushroom",
            amount: [2, 5],
            weight: 1,
          },
          {
            item: "spore",
            amount: [1, 3],
            weight: 1.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  fungalCore: {
    name: "Fungal Core",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [{ amount: 2, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Spore Injection",
        "Infest an enemy with spores.",
        3,
        [{ amount: 6, type: DamageType.Piercing }],
        [
          {
            id: "infested",
            strength: 10,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Mind Infect",
        "Infects the mind of an enemy.",
        2,
        [{ amount: 6, type: DamageType.Psychic }],
        [
          {
            id: "stunned",
            strength: 2,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 50,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "mushroom",
            amount: [2, 5],
            weight: 1,
          },
          {
            item: "spore",
            amount: [1, 3],
            weight: 1.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "fungalCore",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  farulu: {
    name: "Farulu, Fungal Abomination",
    health: 50,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 10,
    },
    damageResistances: [
      { amount: 1, type: "*" },
      { amount: 3, type: DamageType.Poison },
    ],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Spore Injection",
        "Infest an enemy with spores.",
        2,
        [{ amount: 10, type: DamageType.Piercing }],
        [
          {
            id: "infested",
            strength: 10,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Mind Infect",
        "Infects the mind of an enemy.",
        2,
        [{ amount: 10, type: DamageType.Psychic }],
        [
          {
            id: "stunned",
            strength: 4,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.heal("Regenerate", "Regenerate health.", 5, 5, {
        targetRestrictions: [CanTarget.isSelf],
      }),
    ],
    xpValue: 250,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "mushroom",
            amount: [5, 10],
            weight: 1,
          },
          {
            item: "spore",
            amount: [5, 10],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "faruluHead",
            amount: 1,
            weight: 1,
          },
          {
            item: "faruluHands",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.005),
  },
  lostAdventurer: {
    name: "Lost Adventurer",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 5,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slash",
        "A simple slashing attack.",
        3,
        [{ amount: 5, type: DamageType.Slashing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attack(
        "Slam",
        "A simple bludgeoning attack.",
        5,
        [{ amount: 8, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attack(
        "Stab",
        "A simple piercing attack.",
        2.5,
        [{ amount: 4, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 40,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [1, 20],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ironSpear",
            amount: 1,
            weight: 1,
          },
          {
            item: "ironAxe",
            amount: 1,
            weight: 1,
          },
          {
            item: "ironMace",
            amount: 1,
            weight: 1,
          },
          {
            item: "ironShortSword",
            amount: 1,
            weight: 1,
          },
          {
            item: "ironLongSword",
            amount: 1,
            weight: 1,
          },
          {
            item: "ironDagger",
            amount: 1,
            weight: 1,
          },
          {
            item: "ironHelmet",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "ironChestplate",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "ironBoots",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 0.5,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  goblin: {
    name: "Goblin",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 3,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Spear",
        "Are these descriptions even displayed anywhere?",
        3,
        [{ amount: 5, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [5, 9],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bottle",
            amount: 1,
            weight: 1,
          },
          {
            item: "mushroom",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "leather",
            amount: 1,
            weight: 1,
          },
          {
            item: "rope",
            amount: [2, 3],
            weight: 1,
          },
          {
            item: "goblinScrap",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "goblinIdol",
            amount: 1,
            weight: 0.1,
          },
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  hobgoblin: {
    name: "Hobgoblin",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 4,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Spear",
        "Are these descriptions even displayed anywhere?",
        2,
        [{ amount: 6, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 25,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [5, 10],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "leather",
            amount: 1,
            weight: 1,
          },
          {
            item: "rope",
            amount: [2, 3],
            weight: 1,
          },
          {
            item: "ironSpear",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "goblinScrap",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "goblinIdol",
            amount: 1,
            weight: 0.1,
          },
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  goblinShaman: {
    name: "Goblin Shaman",
    health: 8,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 5,
    },
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Fireball",
        "A fiery explosion of magic.",
        6,
        [{ amount: 10, type: DamageType.Fire }],
        [
          {
            id: "burning",
            strength: 3,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Curse",
        "Curses an enemy.",
        3,
        [
          {
            id: "cursed",
            strength: 2,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 20,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [5, 10],
            weight: 1,
          },
          {
            item: "bottle",
            amount: 1,
            weight: 1,
          },
          {
            item: "mushroom",
            amount: [2, 4],
            weight: 1,
          },
          {
            item: "fireballRing",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "goblinScrap",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "goblinIdol",
            amount: 1,
            weight: 0.1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  masterGoblinShaman: {
    name: "Master Goblin Shaman",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 10,
    },
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Fireball",
        "A fiery explosion of magic.",
        4,
        [{ amount: 20, type: DamageType.Fire }],
        [
          {
            id: "burning",
            strength: 5,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Poison Ray",
        "A poisonous ray of magic.",
        3,
        [{ amount: 20, type: DamageType.Poison }],
        [
          {
            id: "poisoned",
            strength: 4,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Curse",
        "Curses an enemy.",
        3,
        [
          {
            id: "cursed",
            strength: 3,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Speed Up",
        "Decrease cooldowns.",
        1,
        [
          {
            id: "haste",
            strength: 5,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
    ],
    xpValue: 40,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [10, 20],
            weight: 1,
          },
          {
            item: "bottle",
            amount: 1,
            weight: 1,
          },
          {
            item: "healthPotion",
            amount: 1,
            weight: 1,
          },
          {
            item: "antidote",
            amount: 1,
            weight: 0.8,
          },
          {
            item: "fireballRing",
            amount: 1,
            weight: 0.4,
          },
          {
            item: "goblinScrap",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "goblinIdol",
            amount: 1,
            weight: 0.3,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  goblinWarrior: {
    name: "Goblin Warrior",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 3,
      [AbilityScore.Intelligence]: 2,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Spear",
        "Are these descriptions even displayed anywhere?",
        1.5,
        [{ amount: 10, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [8, 12],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bottle",
            amount: 1,
            weight: 1,
          },
          {
            item: "mushroom",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "leather",
            amount: 1,
            weight: 1,
          },
          {
            item: "rope",
            amount: [2, 3],
            weight: 1,
          },
          {
            item: "taintedSpear",
            amount: 1,
            weight: 0.1,
          },
          {
            item: "goblinScrap",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "goblinIdol",
            amount: 1,
            weight: 0.3,
          },
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  hobgoblinWarrior: {
    name: "Hobgoblin Warrior",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 4,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 5,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Spear",
        "Are these descriptions even displayed anywhere?",
        2,
        [{ amount: 20, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 40,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [10, 15],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "leather",
            amount: 1,
            weight: 1,
          },
          {
            item: "rope",
            amount: [2, 3],
            weight: 1,
          },
          {
            item: "hobspear",
            amount: 1,
            weight: 0.1,
          },
          {
            item: "goblinScrap",
            amount: [1, 3],
            weight: 1.2,
          },
          {
            item: "goblinIdol",
            amount: 1,
            weight: 0.3,
          },
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  goblinInventor: {
    name: "Goblin Inventor",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 10,
    },
    intrinsicAbilities: [
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
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Poison Dart",
        "Poison enemies with a blow dart.",
        1,
        [{ amount: 6, type: DamageType.Poison }],
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 40,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [20, 25],
            weight: 1,
          },
          {
            item: "goblinScrap",
            amount: [1, 4],
            weight: 1.5,
          },
          {
            item: "goblinIdol",
            amount: 1,
            weight: 0.3,
          },
          {
            item: "firebomb",
            amount: [1, 2],
            weight: 0.8,
          },
          {
            item: "poisonDart",
            amount: [1, 3],
            weight: 0.8,
          },
          {
            item: "venom",
            amount: [1, 2],
            weight: 0.5,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  ghost: {
    name: "Ghost",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [{ amount: 3, type: DamageType.Psychic }],
    intrinsicAbilities: [
      Abilities.attack(
        "Haunt",
        "A spooky attack on the mind.",
        5,
        [{ amount: 5, type: DamageType.Psychic }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 20,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "memory",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.75,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ectoplasm",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },

  cursedGhost: {
    name: "Cursed Ghost",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 2, type: DamageType.Psychic }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Haunt",
        "A spooky attack on the mind.",
        4,
        [{ amount: 6, type: DamageType.Psychic }],
        [
          {
            id: "cursed",
            strength: 1,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 20,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "memory",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.75,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ectoplasm",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  wraith: {
    name: "Wraith",
    health: 45,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 4,
    },
    damageResistances: [{ amount: 5, type: DamageType.Psychic }],
    intrinsicAbilities: [
      Abilities.attack(
        "Haunt",
        "An invasive attack on the mind.",
        4,
        [{ amount: 9, type: DamageType.Psychic }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Fear",
        "Instills a sense of dread in the target.",
        3,
        [
          {
            id: "cursed",
            strength: 2,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Soul Drain",
        "Drains the life force of an enemy.",
        6,
        [{ amount: 10, type: DamageType.Psychic }],
        [
          {
            id: "cursed",
            strength: 2,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 40,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "memory",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "nightmare",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ectoplasm",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  rat: {
    name: "Rat",
    health: 5,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "The rat nibbles you.",
        4,
        [{ amount: 2, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 5,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [0, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ratTail",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.5,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  trollRat: {
    name: "Troll Rat",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "The rat snacks on you.",
        3,
        [{ amount: 6, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Bellow",
        "The troll rat bellows, intimidating its enemies.",
        2,
        [
          {
            id: "stunned",
            strength: 2,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "taintedFlesh",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ratTail",
            amount: 1,
            weight: 1,
          },
          {
            item: "trollTooth",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "trollHeart",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.5,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  plagueRat: {
    name: "Plague Rat",
    health: 8,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "The plague rat bites you.",
        4,
        [{ amount: 3, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Infect",
        "Inflicts a debilitating infection on an enemy.",
        3,
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 20,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "ratTail",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "slimeEgg",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  spider: {
    name: "Spider",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "The spider bites you.",
        4,
        [
          { amount: 10, type: DamageType.Piercing },
          { amount: 2, type: DamageType.Poison },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Poison",
        "Inflicts poison on an enemy.",
        8,
        [
          {
            id: "poisoned",
            strength: 5,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 45,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "silk",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "spiderFang",
            amount: 2,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  spiderSpitter: {
    name: "Spitter Spider",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "The spider bites you.",
        3,
        [
          { amount: 12, type: DamageType.Piercing },
          { amount: 4, type: DamageType.Poison },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Spit",
        "Inflicts poison on an enemy.",
        5,
        [
          {
            id: "poisoned",
            strength: 10,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 65,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "silk",
            amount: [2, 5],
            weight: 1,
          },
          {
            item: "venom",
            amount: [1, 3],
            weight: 0.5,
          },
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "spiderFang",
            amount: 2,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  ancientTroll: {
    name: "Ancient Troll",
    health: 60,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 3,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [
      { amount: 2, type: DamageType.Bludgeoning },
      { amount: 2, type: DamageType.Piercing },
      { amount: 2, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "A powerful slam attack.",
        4,
        [{ amount: 15, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Ancient Rage",
        "Unleash ancient rage.",
        6,
        [{ amount: 20, type: DamageType.Bludgeoning }],
        [
          {
            id: "cursed",
            strength: 2,
            duration: 15,
          },
        ],
        {
          targetRestrictions: [CanTarget.isAlly],
        }
      ),
      Abilities.heal(
        "Regenerate",
        "Regenerate a large amount of health.",
        20,
        10,
        {
          targetRestrictions: [CanTarget.isSelf],
        }
      ),
    ],
    xpValue: 300,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "trollHeart",
            amount: [2, 3],
            weight: 1,
          },
          {
            item: "trollTooth",
            amount: [4, 6],
            weight: 1,
          },
          {
            item: "taintedFlesh",
            amount: [3, 6],
            weight: 1,
          },
          {
            item: "dreamingDust",
            amount: [1, 2],
            weight: 0.5,
          },
          {
            item: "carvingStone",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 3,
        chance: 1,
      },
    ]),
    tick: (entity, deltaTime) => {
      (entity as CreatureInstance).addHealth(deltaTime);

      activateAbilityAndMoveRandomlyOnTick(
        0.8,
        selectRandomAbility,
        0.01
      )(entity, deltaTime);
    },
  },
  friendlySlime: {
    name: "Friendly Slime",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attack(
        "Slime",
        "Slime.",
        1,
        [{ amount: 3, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
    ],
    xpValue: 5,
    lootTable: new LootTable([]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  overgrownGolem: {
    name: "Overgrown Golem",
    health: 60,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 4,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [
      { amount: 4, type: DamageType.Poison },
      { amount: 2, type: "*" },
    ],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Poisonous Slam",
        "Slam with a deadly side effect.",
        4,
        [{ amount: 12, type: DamageType.Bludgeoning }],
        [
          {
            id: "poisoned",
            strength: 4,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attack(
        "Vine Strike",
        "Precision strike with vines from its back.",
        3,
        [{ amount: 15, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 50,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "golemCore",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.5,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "vine",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "livingWood",
            amount: 1,
            weight: 0.2,
          },
          {
            item: "spore",
            amount: [1, 2],
            weight: 0.1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  writhingVines: {
    name: "Writhing Vines",
    health: 50,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 3,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 2, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Vine Strike",
        "Precision strike with vines.",
        4,
        [{ amount: 15, type: DamageType.Piercing }],
        [
          {
            id: "poisoned",
            strength: 4,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attack(
        "Strangle",
        "Choke the life from your target.",
        4,
        [{ amount: 20, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 50,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "vine",
            amount: [2, 5],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  viper: {
    name: "Viper",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Poison }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Bite",
        "Venomous bite.",
        4,
        [{ amount: 12, type: DamageType.Poison }],
        [
          {
            id: "poisoned",
            strength: 3,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attack(
        "Strangle",
        "Choke the life from your target.",
        4,
        [{ amount: 15, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 30,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "vine",
            amount: 1,
            weight: 1,
          },
          {
            item: "venom",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  centaur: {
    name: "Centaur",
    health: 50,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 3, type: "*" }],
    intrinsicAbilities: [
      Abilities.attack(
        "Bow and Arrow",
        "Fire an arrow from a bow.",
        5,
        [{ amount: 20, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attack(
        "Long Sword",
        "Slash with a long sword.",
        3,
        [{ amount: 8, type: DamageType.Slashing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 60,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "vine",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "hoof",
            amount: [1, 4],
            weight: 1.5,
          },
          {
            item: "horseshoe",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "livingWoodBow",
            amount: 1,
            weight: 1,
          },
          {
            item: "livingWoodLongSword",
            amount: 1,
            weight: 1,
          },
          {
            item: "livingWood",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.3,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  friendlyCentaur: {
    name: "Friendly Centaur",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 2, type: "*" }],
    intrinsicAbilities: [
      Abilities.attack(
        "Bow and Arrow",
        "Fire an arrow from a bow.",
        5,
        [{ amount: 10, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
      Abilities.attack(
        "Long Sword",
        "Slash with a long sword.",
        3,
        [{ amount: 4, type: DamageType.Slashing }],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
    ],
    xpValue: 0,
    lootTable: new LootTable([]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  treant: {
    name: "Treant",
    health: 50,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [
      { amount: 5, type: "*" },
      { amount: 5, type: DamageType.Poison },
      { amount: 2, type: DamageType.Piercing },
      { amount: 2, type: DamageType.Bludgeoning },
      { amount: 2, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Trunk Slam",
        "Slam but tree.",
        5,
        [{ amount: 25, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 75,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "vine",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "livingWood",
            amount: [1, 3],
            weight: 1.5,
          },
          {
            item: "treantSap",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  elderTreant: {
    name: "Elder Treant",
    health: 100,
    abilityScores: {
      [AbilityScore.Strength]: 8,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 8,
    },
    damageResistances: [
      { amount: 7, type: "*" },
      { amount: 7, type: DamageType.Poison },
      { amount: 3, type: DamageType.Piercing },
      { amount: 3, type: DamageType.Bludgeoning },
      { amount: 3, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Trunk Slam",
        "Slam but tree.",
        5,
        [{ amount: 35, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 100,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "vine",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "livingWood",
            amount: [1, 3],
            weight: 1.5,
          },
          {
            item: "treantSap",
            amount: 1,
            weight: 0.8,
          },
          {
            item: "treantSap",
            amount: 2,
            weight: 0.2,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "livingWood",
            amount: 2,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  friendlyTreant: {
    name: "Friendly Treant",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [
      { amount: 2, type: "*" },
      { amount: 3, type: DamageType.Poison },
      { amount: 1, type: DamageType.Piercing },
      { amount: 1, type: DamageType.Bludgeoning },
      { amount: 1, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Trunk Slam",
        "Slam but tree.",
        5,
        [{ amount: 15, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
    ],
    xpValue: 0,
    lootTable: new LootTable([]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  skeletonWarrior: {
    name: "Skeleton Warrior",
    health: 50,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 3, type: DamageType.Piercing }],
    intrinsicAbilities: [
      Abilities.attack(
        "Slash",
        "A slashing attack with a bone sword.",
        1,
        [{ amount: 10, type: DamageType.Slashing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "War Cry",
        "A bone-chilling war cry.",
        2,
        [{ amount: 10, type: DamageType.Psychic }],
        [
          {
            id: "cursed",
            strength: 4,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 80,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bone",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "skeletonKey",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "ancientSpirit",
            amount: 1,
            weight: 1,
          },
          {
            item: "ashes",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  skeletonBonecaller: {
    name: "Skeleton Bonecaller",
    health: 40,
    abilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 3, type: DamageType.Piercing }],
    intrinsicAbilities: [
      Abilities.summon(
        "Summon Skeleton",
        "Summons a skeleton to fight for you.",
        2,
        [{ id: "skeleton", amount: 1 }]
      ),
      Abilities.attackWithStatusEffect(
        "Bone Shard",
        "Launches a bone shard at an enemy.",
        1,
        [{ amount: 8, type: DamageType.Piercing }],
        [
          {
            id: "cursed",
            strength: 2,
            duration: 3,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 100,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bone",
            amount: [2, 5],
            weight: 1,
          },
          {
            item: "skeletonKey",
            amount: 1,
            weight: 0.5,
          },
          {
            item: "memory",
            amount: [1, 2],
            weight: 0.5,
          },
          {
            item: "ancientSpirit",
            amount: 1,
            weight: 1,
          },
          {
            item: "ashes",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  cryptGuardGolem: {
    name: "Crypt Guard Golem",
    health: 80,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [
      { amount: 3, type: DamageType.Bludgeoning },
      { amount: 3, type: DamageType.Piercing },
      { amount: 3, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "A basic slam attack.",
        1,
        [{ amount: 15, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Harden",
        "Harden your defenses.",
        2,
        [
          {
            id: "stoneskin",
            strength: 5,
            duration: 30,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 150,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "golemCore",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 0.5,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "livingStone",
            amount: [2, 3],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  livingStatue: {
    name: "Living Statue",
    health: 60,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [
      { amount: 3, type: DamageType.Bludgeoning },
      { amount: 3, type: DamageType.Piercing },
      { amount: 3, type: DamageType.Slashing },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "A basic slam attack.",
        1,
        [{ amount: 15, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Harden",
        "Harden your defenses.",
        2,
        [
          {
            id: "stoneskin",
            strength: 5,
            duration: 25,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 120,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "livingStone",
            amount: [2, 3],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  banshee: {
    name: "Banshee",
    health: 60,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 6,
    },
    damageResistances: [{ amount: 2, type: DamageType.Piercing }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Wail",
        "A haunting wail that chills the soul.",
        2,
        [{ amount: 15, type: DamageType.Psychic }],
        [
          {
            id: "cursed",
            strength: 3,
            duration: 4,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Ethereal Step",
        "Become ethereal for a short time.",
        3,
        [
          {
            id: "dreaming",
            strength: 100,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
      Abilities.applyStatusEffect(
        "Curse",
        "Curses an enemy with a haunting presence.",
        3,
        [
          {
            id: "cursed",
            strength: 5,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 120,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "memory",
            amount: [4, 5],
            weight: 1,
          },
          {
            item: "nightmare",
            amount: [1, 2],
            weight: 0.5,
          },
          {
            item: "ectoplasm",
            amount: [2, 4],
            weight: 1,
          },
          {
            item: "ashes",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ancientSpirit",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "wailingNecklace",
            amount: 1,
            weight: 0.1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  skeletonHero: {
    name: "Skeleton Hero",
    health: 150,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 4,
      [AbilityScore.Intelligence]: 15,
    },
    damageResistances: [
      { amount: 8, type: DamageType.Piercing },
      { amount: 5, type: "*" },
    ],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Bone Shatter",
        "A powerful strike that shatters bones.",
        2,
        [{ amount: 20, type: DamageType.Bludgeoning }],
        [
          {
            id: "stunned",
            strength: 2,
            duration: 2,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.heal("Undying Will", "Heal", 1, 25, {
        targetRestrictions: [CanTarget.isSelf],
      }),
      Abilities.attackWithStatusEffect(
        "Greatsword",
        "A powerful strike with a greatsword.",
        2,
        [{ amount: 25, type: DamageType.Slashing }],
        [{ id: "cursed", strength: 5, duration: 3 }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 300,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "bone",
            amount: [10, 20],
            weight: 1,
          },
          {
            item: "memory",
            amount: [5, 10],
            weight: 1,
          },
          {
            item: "ashes",
            amount: [2, 5],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ancientSpirit",
            amount: [2, 3],
            weight: 1,
          },
          {
            item: "wakingDust",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ancientGreatsword",
            amount: 1,
            weight: 1,
          },
          {
            item: "ancientBoneNecklace",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
  },
  friendlySkeleton: {
    name: "Friendly Skeleton",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 1,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Piercing }],
    intrinsicAbilities: [
      Abilities.attack(
        "Bone",
        "A forceful hit with a bone.",
        1,
        [{ amount: 4, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
    ],
    xpValue: 0,
    lootTable: new LootTable([]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  piranha: {
    name: "Piranha",
    health: 30,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 1, type: DamageType.Piercing }],
    intrinsicAbilities: [
      Abilities.attack(
        "Bite",
        "A quick bite from the piranha.",
        0.5,
        [{ amount: 5, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 30,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "bone",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "trollTooth",
            amount: [1, 2],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "demonScale",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.6,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  siren: {
    name: "Siren",
    health: 50,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 3,
      [AbilityScore.Intelligence]: 15,
    },
    damageResistances: [{ amount: 15, type: DamageType.Psychic }],
    intrinsicAbilities: [
      Abilities.attack(
        "Sonic Wail",
        "A deafening wail that disorients foes.",
        1,
        [{ amount: 10, type: DamageType.Psychic }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Charm",
        "Charm your target with a haunting melody.",
        2,
        [
          {
            id: "stunned",
            strength: 20,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 75,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "demonScale",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "enchantingSpirit",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  giantSquid: {
    name: "Giant Squid",
    health: 120,
    abilityScores: {
      [AbilityScore.Strength]: 8,
      [AbilityScore.Constitution]: 7,
      [AbilityScore.Intelligence]: 3,
    },
    damageResistances: [{ amount: 5, type: DamageType.Bludgeoning }],
    intrinsicAbilities: [
      Abilities.attack(
        "Tentacle Slam",
        "A powerful slam with a tentacle.",
        1,
        [{ amount: 25, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
      Abilities.attackWithStatusEffect(
        "Ink Spray",
        "Sprays ink to blind and confuse enemies.",
        2,
        [{ amount: 20, type: DamageType.Poison }],
        [
          {
            id: "stunned",
            strength: 3,
            duration: 5,
          },
          {
            id: "cursed",
            strength: 3,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Fortify",
        "Fortify your defenses with a shell.",
        2,
        [
          {
            id: "blocking",
            strength: 20,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 200,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [4, 6],
            weight: 1,
          },
          {
            item: "demonScale",
            amount: [2, 3],
            weight: 0.5,
          },
          {
            item: "ink",
            amount: [2, 4],
            weight: 0.8,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
  },
  bonecrusherCrab: {
    name: "Bonecrusher Crab",
    health: 40,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 4,
      [AbilityScore.Intelligence]: 1,
    },
    damageResistances: [{ amount: 2, type: DamageType.Bludgeoning }],
    intrinsicAbilities: [
      Abilities.attack(
        "Claw",
        "A powerful claw strike from the bonecrusher crab.",
        1,
        [{ amount: 15, type: DamageType.Slashing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Crush",
        "Crush your target with a powerful strike.",
        2,
        [{ amount: 20, type: DamageType.Bludgeoning }],
        [
          {
            id: "poisoned",
            strength: 2,
            duration: 5,
          },
          {
            id: "stunned",
            strength: 2,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 60,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [2, 4],
            weight: 1,
          },
          {
            item: "demonScale",
            amount: [1, 2],
            weight: 0.5,
          },
          {
            item: "livingStone",
            amount: [2, 3],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "fortressShell",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.3,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  octoCrab: {
    name: "Octo-Crab",
    health: 80,
    abilityScores: {
      [AbilityScore.Strength]: 6,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 2,
    },
    damageResistances: [{ amount: 3, type: DamageType.Bludgeoning }],
    intrinsicAbilities: [
      Abilities.attack(
        "Tentacle Slam",
        "A powerful slam with a tentacle.",
        1,
        [{ amount: 20, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Ink Spray",
        "Sprays ink to blind and confuse enemies.",
        2,
        [{ amount: 15, type: DamageType.Poison }],
        [
          {
            id: "stunned",
            strength: 3,
            duration: 5,
          },
          {
            id: "cursed",
            strength: 3,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Fortify",
        "Fortify your defenses with a shell.",
        2,
        [
          {
            id: "blocking",
            strength: 15,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 100,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [3, 5],
            weight: 1,
          },
          {
            item: "demonScale",
            amount: [1, 2],
            weight: 0.5,
          },
          {
            item: "ink",
            amount: [1, 3],
            weight: 0.8,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "midnightShell",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.3,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  hordecallerCrab: {
    name: "Hordecaller Crab",
    health: 100,
    abilityScores: {
      [AbilityScore.Strength]: 7,
      [AbilityScore.Constitution]: 6,
      [AbilityScore.Intelligence]: 3,
    },
    damageResistances: [{ amount: 4, type: DamageType.Bludgeoning }],
    intrinsicAbilities: [
      Abilities.summon(
        "Summon Piranha Swarm",
        "Calls forth a swarm of piranhas to assist in battle.",
        3,
        [{ id: "piranha", amount: 3 }]
      ),
      Abilities.summon(
        "Summon Siren",
        "Calls forth a siren to assist in battle.",
        3,
        [{ id: "siren", amount: 1 }]
      ),
      Abilities.summon("Summon Giant Squid", "Summons a giant squid.", 3, [
        { id: "giantSquid", amount: 2 },
      ]),
    ],
    xpValue: 200,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "meat",
            amount: [5, 8],
            weight: 1,
          },
          {
            item: "demonScale",
            amount: [2, 3],
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "hordeShell",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.3,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  kraken: {
    name: "Kraken",
    health: 300,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 25,
    },
    damageResistances: [{ amount: 10, type: DamageType.Bludgeoning }],
    intrinsicAbilities: [
      Abilities.attack(
        "Tentacle Slam",
        "Slams a tentacle down on the target.",
        1,
        [{ amount: 20, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.summon(
        "Call Minions",
        "Calls forth smaller sea creatures to assist.",
        3,
        [
          { id: "siren", amount: 2 },
          { id: "piranha", amount: 4 },
        ]
      ),
      Abilities.applyStatusEffect(
        "Ink Spray",
        "Sprays ink to blind enemies.",
        2,
        [
          {
            id: "stunned",
            strength: 5,
            duration: 5,
          },
          {
            id: "cursed",
            strength: 5,
            duration: 5,
          },
          {
            id: "poisoned",
            strength: 5,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 500,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ink",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "demonScale",
            amount: [2, 4],
            weight: 0.5,
          },
        ]),
        amount: 3,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "krakenShellFragment",
            amount: [5, 10],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "krakenClawAxe",
            amount: 1,
            weight: 1,
          },
          {
            item: "krakenToothDagger",
            amount: 1,
            weight: 1,
          },
          {
            item: "krakenEyeNecklace",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  friendlyGolem: {
    name: "Friendly Golem",
    health: 100,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [
      { amount: 5, type: DamageType.Bludgeoning },
      {
        amount: 5,
        type: DamageType.Piercing,
      },
      {
        amount: 5,
        type: DamageType.Slashing,
      },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "A forceful slam from the friendly golem.",
        1,
        [{ amount: 25, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.not(CanTarget.isAlly)] }
      ),
      Abilities.applyStatusEffect(
        "Harden",
        "Harden your defenses.",
        2,
        [
          {
            id: "stoneskin",
            strength: 10,
            duration: 30,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 0,
    lootTable: new LootTable([]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  yeti: {
    name: "Yeti",
    health: 100,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 10, type: DamageType.Cold }],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slams down on the target.",
        1.5,
        [{ amount: 30, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Frozen Breath",
        "Blows freezing particles at the target.",
        3,
        [{ amount: 40, type: DamageType.Cold }],
        [{ id: "frozen", strength: 20, duration: 5 }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 500,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ice",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "yetiFur",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "yetiSkull",
            amount: 1,
            weight: 0.1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  iceGolem: {
    name: "Ice Golem",
    health: 150,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 10, type: DamageType.Cold }],
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slams down on the target.",
        1,
        [{ amount: 30, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 600,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "golemCore",
            amount: 1,
            weight: 0.5,
          },
        ]),
        amount: 1,
        chance: 0.5,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ice",
            amount: [1, 4],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  frostElemental: {
    name: "Frost Elemental",
    health: 200,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 15, type: DamageType.Cold }],
    intrinsicAbilities: [
      Abilities.attack(
        "Ice Spike",
        "Imaple target with ice.",
        2,
        [{ amount: 50, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffectLocation(
        "Snow Storm",
        "Freezing winds and snow whirls around the room.",
        1.5,
        [{ amount: 25, type: DamageType.Cold }],
        [{ id: "frozen", strength: 10, duration: 3 }],
        true,
        false,
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 750,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ice",
            amount: [1, 5],
            weight: 1,
          },
          {
            item: "frozenCrystal",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  frostGiant: {
    name: "Frost Giant",
    health: 350,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 15, type: DamageType.Cold }],
    intrinsicAbilities: [
      Abilities.attack(
        "Ice Club",
        "Bludgeoning club attack.",
        2,
        [{ amount: 60, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Protect",
        "Significantly reduce damage taken.",
        2,
        [
          { id: "stoneskin", strength: 10, duration: 2 },
          { id: "blocking", strength: 10, duration: 2 },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
    ],
    xpValue: 1000,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ice",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "giantTooth",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "blizzard",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.05,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  wight: {
    name: "Wight",
    health: 100,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 5, type: DamageType.Cold }],
    intrinsicAbilities: [
      Abilities.attack(
        "Frostbite",
        "A cold bite attack.",
        2,
        [{ amount: 35, type: DamageType.Cold }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 300,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ice",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "rottenFlesh",
            amount: [1, 3],
            weight: 0.9,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  magmaElemental: {
    name: "Magma Elemental",
    health: 250,
    abilityScores: {
      [AbilityScore.Strength]: 12,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 3,
    },
    damageResistances: [{ amount: 100, type: DamageType.Fire }],
    intrinsicAbilities: [
      Abilities.attack(
        "Lava Burst",
        "Unleash a burst of lava at the target.",
        2,
        [{ amount: 40, type: DamageType.Fire }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      {
        name: "Magma Eruption",
        getDescription: "Erupts magma around itself, damaging nearby enemies.",
        getCooldown: 3,
        getTargetCount: 1,
        canTarget: CanTarget.isTargetALocation,
        activate: (self, targets) => {
          const location = targets[0] as Location;

          for (const entity of Array.from(location.entities)) {
            if (CanTarget.isAlly(self, entity)) {
              (entity as CreatureInstance).addStatusEffect({
                id: "burning",
                strength: 5,
                duration: 10,
              });
            }
          }

          getIo().sendMsgToRoom(
            location.id,
            "Magma erupts from the ground, scorching everything nearby!"
          );

          return true;
        },
      },
    ],
    xpValue: 850,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ember",
            amount: [1, 3],
            weight: 1,
          },
          {
            item: "livingStone",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  volcanoSpirit: {
    name: "Volcano Spirit",
    health: 300,
    abilityScores: {
      [AbilityScore.Strength]: 15,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 100, type: DamageType.Fire }],
    intrinsicAbilities: [
      Abilities.attack(
        "Lava Burst",
        "Unleash a burst of lava at the target.",
        2,
        [{ amount: 50, type: DamageType.Fire }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffectLocation(
        "Volcanic Eruption",
        "Erupts magma around itself, damaging nearby enemies.",
        1.5,
        [{ amount: 30, type: DamageType.Fire }],
        [{ id: "burning", strength: 10, duration: 10 }],
        true,
        false,
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 1200,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ember",
            amount: [2, 5],
            weight: 1,
          },
          {
            item: "livingStone",
            amount: [2, 4],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "volcanicAmulet",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  magmaSlime: {
    name: "Magma Slime",
    health: 80,
    abilityScores: {
      [AbilityScore.Strength]: 8,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 50, type: DamageType.Fire }],
    intrinsicAbilities: [
      Abilities.attack(
        "Lava Splash",
        "Splashes lava at the target.",
        1,
        [{ amount: 20, type: DamageType.Fire }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Heat Aura",
        "Emits a heat aura that damages nearby enemies.",
        2,
        [
          {
            id: "burning",
            strength: 5,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 150,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ember",
            amount: [1, 2],
            weight: 1,
          },
          {
            item: "ashes",
            amount: [3, 5],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slime",
            amount: [5, 10],
            weight: 1,
          },
          {
            item: "magmaSlimeEgg",
            amount: 1,
            weight: 0.2,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  wyvern: {
    name: "Wyvern",
    health: 400,
    abilityScores: {
      [AbilityScore.Strength]: 15,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 5,
    },
    damageResistances: [{ amount: 20, type: DamageType.Fire }],
    intrinsicAbilities: [
      Abilities.attack(
        "Fire Breath",
        "Breathes fire at the target.",
        2,
        [{ amount: 60, type: DamageType.Fire }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffectLocation(
        "Flame Wave",
        "Unleashes a wave of flame around itself.",
        1.5,
        [{ amount: 40, type: DamageType.Fire }],
        [{ id: "burning", strength: 15, duration: 10 }],
        true,
        false,
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Claw",
        "Slashes at the target with claws.",
        1,
        [{ amount: 30, type: DamageType.Slashing }],
        [{ id: "poisoned", strength: 5, duration: 5 }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 1500,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ember",
            amount: [3, 6],
            weight: 1,
          },
          {
            item: "dragonScale",
            amount: [1, 2],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "wyvernHeart",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 0.4,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  animatedLavaFlow: {
    name: "Animated Lava Flow",
    health: 200,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 0,
    },
    damageResistances: [{ amount: 100, type: DamageType.Fire }],
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Lash",
        "Reach out with a fiery lash.",
        2,
        [{ amount: 40, type: DamageType.Fire }],
        [
          {
            id: "burning",
            strength: 4,
            duration: 25,
          },
        ],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
    ],
    xpValue: 500,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ember",
            amount: [2, 4],
            weight: 1,
          },
          {
            item: "livingStone",
            amount: [1, 3],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.8, selectRandomAbility, 0.01),
  },
  dragon: {
    name: "Dragon",
    health: 1000,
    abilityScores: {
      [AbilityScore.Strength]: 25,
      [AbilityScore.Constitution]: 25,
      [AbilityScore.Intelligence]: 25,
    },
    damageResistances: [
      { amount: 150, type: DamageType.Fire },
      { amount: 50, type: DamageType.Poison },
      { amount: 15, type: "*" },
    ],
    intrinsicAbilities: [
      Abilities.attack(
        "Fire Breath",
        "Breathes fire at the target.",
        3,
        [{ amount: 100, type: DamageType.Fire }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffectLocation(
        "Inferno",
        "Unleashes a massive wave of flame around itself.",
        2,
        [{ amount: 80, type: DamageType.Fire }],
        [{ id: "burning", strength: 20, duration: 15 }],
        true,
        false,
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.attackWithStatusEffect(
        "Claw Swipe",
        "Slashes at the target with claws.",
        1.5,
        [{ amount: 70, type: DamageType.Slashing }],
        [{ id: "poisoned", strength: 10, duration: 10 }],
        { targetRestrictions: [CanTarget.isAlly] }
      ),
      Abilities.applyStatusEffect(
        "Dragon's Might",
        "Empowers itself, increasing its damage output.",
        3,
        [
          {
            id: "overcharged",
            strength: 20,
            duration: 10,
          },
        ],
        { targetRestrictions: [CanTarget.isSelf] }
      ),
      Abilities.summon("Wyrmcall", "Summons lesser dragons to assist.", 3, [
        { id: "wyvern", amount: 2 },
      ]),
    ],
    xpValue: 5000,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
            amount: [3000, 5000],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "ashes",
            amount: [10, 20],
            weight: 1,
          },
          {
            item: "ember",
            amount: [10, 20],
            weight: 1,
          },
        ]),
        amount: 2,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "dragonScale",
            amount: [15, 20],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
      {
        item: new WeightedTable<ItemId>([
          {
            item: "dragonHead",
            amount: 1,
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
  },
};

const entities: Record<EntityId, EntityDefinition> = {
  ...creatures,
  container: {
    name: "Container",
    interact: async (entity, player, interaction, action) =>
      inventoryInteraction(
        entity as ContainerInstance,
        player,
        interaction,
        action,
        (entity as ContainerInstance).inventory,
        entity.name
      ),
  },
  signPost: {
    name: "Sign Post",
    interact: async (entity, player, interaction, action) => {
      if (!interaction) {
        interaction = {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "readSign",
              text: "Read Sign",
            },
          ],
        };

        return interaction;
      }

      if (action === "readSign") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "You remember you are illiterate."
        );

        return {
          ...interaction,
          state: undefined,
          actions: [
            {
              id: "readSignAgain",
              text: "Read Sign Again",
            },
            {
              id: "giveUp",
              text: "Give Up",
            },
          ],
        };
      }

      if (action === "readSignAgain") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "You still cannot read."
        );

        return {
          ...interaction,
          state: undefined,
          actions: [
            {
              id: "readSignAgain",
              text: "Read Sign Again",
            },
            {
              id: "giveUp",
              text: "Give Up",
            },
          ],
        };
      }

      return undefined;
    },
  },
  anvil: {
    name: "Anvil",
    interact: craftingInteraction(
      "Crafting at Anvil",
      new RecipeGroup([
        new Recipe({ ironBar: 1 }, new ItemInstance("rustySword", 1)),
        new Recipe({ ironBar: 3 }, new ItemInstance("ironSpear", 1)),
        new Recipe({ ironBar: 3 }, new ItemInstance("ironAxe", 1)),
        new Recipe({ ironBar: 3 }, new ItemInstance("ironMace", 1)),
        new Recipe({ ironBar: 3 }, new ItemInstance("ironShortSword", 1)),
        new Recipe({ ironBar: 3 }, new ItemInstance("ironLongSword", 1)),
        new Recipe({ ironBar: 3 }, new ItemInstance("ironDagger", 1)),
        new Recipe({ ironBar: 5 }, new ItemInstance("ironHelmet", 1)),
        new Recipe({ ironBar: 5 }, new ItemInstance("ironChestplate", 1)),
        new Recipe({ ironBar: 5 }, new ItemInstance("ironBoots", 1)),
        new Recipe({ ironBar: 1 }, new ItemInstance("dart", 10)),
        new Recipe(
          { ironBar: 10, spore: 5 },
          new ItemInstance("fungalSpear", 1)
        ),
        new Recipe(
          { ironBar: 10, spore: 5, slime: 5 },
          new ItemInstance("fungalChestplate", 1)
        ),
        new Recipe(
          { ironBar: 10, spore: 5, slime: 5, leather: 5 },
          new ItemInstance("paddedBoots", 1)
        ),
        new Recipe(
          { ironBar: 5, bone: 5, memory: 5, trollTooth: 2 },
          new ItemInstance("finalStandEarring", 1)
        ),
        new Recipe(
          {
            finalStandEarring: 1,
            spore: 10,
            slime: 10,
            slimeEgg: 1,
            spiderFang: 1,
          },
          new ItemInstance("indomitableEarring", 1)
        ),
        new Recipe(
          { ironBar: 12, memory: 10, nightmare: 1, ectoplasm: 5 },
          new ItemInstance("spectralShield", 1)
        ),
        new Recipe(
          { ironBar: 10, leather: 5, memory: 5, nightmare: 3, ectoplasm: 3 },
          new ItemInstance("spectralBoots", 1)
        ),
        new Recipe(
          { ironBar: 10, trollTooth: 3, memory: 5, nightmare: 3, ectoplasm: 3 },
          new ItemInstance("dreamripper", 1)
        ),
        new Recipe(
          {
            ironBar: 10,
            spectralDust: 5,
            inertDust: 5,
            salt: 5,
            antidote: 2,
          },
          new ItemInstance("phaseOutRing", 1)
        ),
        new Recipe(
          {
            ironBar: 10,
            venom: 5,
            healthPotion: 3,
          },
          new ItemInstance("vengefulRing", 1)
        ),
        new Recipe(
          {
            vengefulRing: 1,
            goldBar: 5,
            ember: 3,
            healthPotion: 5,
          },
          new ItemInstance("drainingRing", 1)
        ),
        new Recipe(
          {
            ironBar: 5,
            goldBar: 5,
            ectoplasm: 3,
            wakingDust: 3,
          },
          new ItemInstance("healthfulAmulet", 1)
        ),
        new Recipe(
          { ironBar: 5, ironDagger: 1, venom: 5 },
          new ItemInstance("fangbearerAnklet", 1)
        ),
        new Recipe(
          {
            ironHelmet: 1,
            silk: 5,
            venom: 5,
            spiderFang: 2,
          },
          new ItemInstance("mandibleHelmet", 1)
        ),
        new Recipe(
          {
            mandibleHelmet: 1,
            spiderFang: 8,
            venom: 12,
            silk: 5,
          },
          new ItemInstance("theMaw", 1)
        ),
        new Recipe(
          {
            livingStone: 8,
            ashes: 5,
            ironBar: 3,
            wakingDust: 3,
          },
          new ItemInstance("livingStoneChestplate", 1)
        ),
        new Recipe(
          {
            livingStone: 5,
            ashes: 3,
            spore: 5,
            fungalCore: 1,
          },
          new ItemInstance("rootBoots", 1)
        ),
        new Recipe(
          {
            livingStone: 5,
            ancientSpirit: 1,
            wakingDust: 5,
          },
          new ItemInstance("avalancheWarhammer", 1)
        ),
        new Recipe(
          {
            boneNecklace: 1,
            ancientSpirit: 1,
            wakingDust: 5,
          },
          new ItemInstance("ancientBoneNecklace", 1)
        ),
        new Recipe(
          {
            rope: 5,
            ancientSpirit: 2,
            nightmare: 1,
          },
          new ItemInstance("wailingNecklace", 1)
        ),
        new Recipe(
          {
            ironSpear: 1,
            ironBar: 5,
            goblinScrap: 5,
            taintedFlesh: 1,
          },
          new ItemInstance("taintedSpear", 1)
        ),
        new Recipe(
          {
            taintedSpear: 1,
            ironBar: 15,
            goblinScrap: 15,
          },
          new ItemInstance("hobspear", 1)
        ),
        new Recipe(
          {
            goldBar: 5,
            enchantingSpirit: 3,
            ink: 5,
          },
          new ItemInstance("enrapturingRing", 1)
        ),
        new Recipe(
          {
            goldBar: 5,
            demonScale: 10,
            ink: 4,
            livingStone: 2,
            livingWood: 2,
          },
          new ItemInstance("scaleChestplate", 1)
        ),
        new Recipe(
          {
            goldBar: 5,
            demonScale: 10,
            ink: 10,
            ember: 3,
          },
          new ItemInstance("squidHelmet", 1)
        ),
        new Recipe(
          {
            krakenShellFragment: 5,
            ember: 5,
            ice: 5,
          },
          new ItemInstance("flamebane", 1)
        ),
        new Recipe(
          {
            fireballRing: 1,
            ember: 5,
            dragonScale: 1,
            dreamingDust: 5,
          },
          new ItemInstance("dragonfireRing", 1)
        ),
        new Recipe(
          {
            demonScale: 15,
            krakenShellFragment: 10,
            dragonScale: 10,
            wakingDust: 5,
            dreamingDust: 5,
          },
          new ItemInstance("beastScaleArmor", 1)
        ),
      ])
    ),
  },
  furnace: {
    name: "Furnace",
    interact: craftingInteraction(
      "Crafting at Furnace",
      new RecipeGroup([
        new Recipe({ coal: 1, ironOre: 2 }, new ItemInstance("ironBar", 1)),
        new Recipe({ coal: 1, goldOre: 3 }, new ItemInstance("goldBar", 1)),
        new Recipe({ rottenFlesh: 1 }, new ItemInstance("leather", 1)),
        new Recipe({ meat: 1, coal: 1 }, new ItemInstance("grilledMeat", 1)),
        new Recipe(
          {
            eyeball: 1,
            coal: 1,
          },
          new ItemInstance("friedEyeball", 1)
        ),
        new Recipe(
          { salt: 3, meat: 1, coal: 1 },
          new ItemInstance("saltedMeat", 1)
        ),
        new Recipe(
          { salt: 5, meat: 2, mushroom: 3, coal: 3 },
          new ItemInstance("delversMeal", 1)
        ),
        new Recipe(
          {
            dart: 10,
            venom: 1,
          },
          new ItemInstance("poisonDart", 10)
        ),
        new Recipe(
          {
            trollHeart: 1,
            fungalCore: 1,
            slimeEgg: 1,
            spore: 10,
            slime: 10,
          },
          new ItemInstance("unnaturalHeart", 1)
        ),
        new Recipe(
          {
            ectoplasm: 3,
            coal: 1,
          },
          [
            new ItemInstance("spectralDust", 1),
            new ItemInstance("inertDust", 2),
          ]
        ),
        new Recipe(
          {
            coal: 1,
            salt: 1,
            spectralDust: 1,
          },
          new ItemInstance("inertDust", 3)
        ),
        new Recipe(
          {
            coal: 1,
            nightmare: 1,
            spectralDust: 1,
            spore: 3,
          },
          new ItemInstance("dreamingDust", 1)
        ),
        new Recipe(
          {
            coal: 1,
            salt: 3,
            inertDust: 15,
          },
          new ItemInstance("wakingDust", 1)
        ),
        new Recipe(
          {
            goblinIdol: 1,
          },
          new ItemInstance("goblinScrap", 3)
        ),
        new Recipe(
          {
            magmaSlimeEgg: 1,
            salt: 5,
          },
          new ItemInstance("volcanicOmelet", 1)
        ),
      ])
    ),
  },
  workbench: {
    name: "Workbench",
    interact: craftingInteraction(
      "Crafting at Workbench",
      new RecipeGroup([
        new Recipe({}, new ItemInstance("bigStick", 1)),
        new Recipe({ leather: 5 }, new ItemInstance("leatherTunic", 1)),
        new Recipe({ bottle: 1, slime: 1 }, new ItemInstance("slimeJar", 1)),
        new Recipe({ leather: 1 }, new ItemInstance("rope", 1)),
        new Recipe(
          { bone: 1, rope: 10, trollTooth: 1 },
          new ItemInstance("boneNecklace", 1)
        ),
        new Recipe({ bone: 10 }, new ItemInstance("boneClub", 1)),
        new Recipe(
          {
            bone: 5,
            ratTail: 5,
          },
          new ItemInstance("tailFlail", 1)
        ),
        new Recipe(
          {
            rope: 3,
            leather: 1,
          },
          new ItemInstance("sling", 1)
        ),
        new Recipe(
          {
            sling: 1,
            slime: 10,
          },
          new ItemInstance("slimeSling", 1)
        ),
        new Recipe(
          {
            slime: 20,
            slimeEgg: 3,
            spore: 4,
          },
          new ItemInstance("slimeHorn", 1)
        ),
        new Recipe(
          {
            ratTail: 5,
            bone: 5,
            slime: 5,
            eyeball: 2,
            trollTooth: 2,
            skull: 1,
          },
          new ItemInstance("repulsiveNecklace", 1)
        ),
        new Recipe(
          {
            bone: 15,
            skull: 1,
          },
          new ItemInstance("skeletalSword", 1)
        ),
        new Recipe(
          {
            leather: 5,
            trollTooth: 4,
          },
          new ItemInstance("furyBelt", 1)
        ),
        new Recipe(
          {
            bone: 25,
            taintedFlesh: 10,
            eyeball: 5,
            trollHeart: 5,
          },
          new ItemInstance("horrifyingBow", 1)
        ),
        new Recipe(
          {
            rottenFlesh: 20,
            taintedFlesh: 3,
            ratTail: 10,
          },
          new ItemInstance("undeadBoots", 1)
        ),
        new Recipe(
          {
            rottenFlesh: 20,
            taintedFlesh: 3,
            trollHeart: 1,
          },
          new ItemInstance("undeadChestplate", 1)
        ),
        new Recipe(
          {
            rottenFlesh: 20,
            taintedFlesh: 3,
            eyeball: 5,
            skull: 1,
          },
          new ItemInstance("undeadHelmet", 1)
        ),
        new Recipe(
          {
            leather: 5,
            rope: 5,
          },
          new ItemInstance("backpack", 1)
        ),
        new Recipe(
          {
            backpack: 1,
            spore: 5,
            mushroom: 5,
            slime: 5,
          },
          new ItemInstance("fungalBackpack", 1)
        ),
        new Recipe(
          {
            ironOre: 1,
            bone: 5,
            memory: 5,
          },
          new ItemInstance("carvingStone", 1)
        ),
        new Recipe(
          {
            skull: 1,
            memory: 10,
            slime: 3,
          },
          new ItemInstance("possessedSkull", 1)
        ),
        new Recipe(
          {
            skull: 1,
            bone: 5,
            rottenFlesh: 5,
          },
          new ItemInstance("hordeFlute", 1)
        ),
        new Recipe(
          {
            ashes: 5,
            ember: 5,
          },
          new ItemInstance("firebomb", 1)
        ),
        new Recipe(
          {
            silk: 10,
            memory: 5,
            nightmare: 3,
            dreamingDust: 5,
          },
          new ItemInstance("dreamersMask", 1)
        ),
        new Recipe(
          {
            spiderFang: 1,
          },
          [new ItemInstance("venom", 1), new ItemInstance("bone", 1)]
        ),
        new Recipe(
          {
            venom: 5,
            inertDust: 2,
            bottle: 1,
          },
          new ItemInstance("antidote", 1)
        ),
        new Recipe(
          {
            venom: 10,
            silk: 5,
            ironBar: 1,
            spiderFang: 2,
          },
          new ItemInstance("spiderCloak", 1)
        ),
        new Recipe(
          {
            leather: 1,
            inertDust: 1,
          },
          new ItemInstance("paper", 3)
        ),
        new Recipe(
          {
            bottle: 2,
            spore: 3,
            livingStone: 1,
            ashes: 1,
          },
          new ItemInstance("stoneskinPotion", 2)
        ),
        new Recipe(
          {
            paper: 1,
            ashes: 5,
            wakingDust: 1,
            coal: 3,
            memory: 3,
          },
          new ItemInstance("burnOutScroll", 1)
        ),
        new Recipe(
          {
            livingWood: 10,
            vine: 20,
            venom: 5,
            goldBar: 1,
          },
          new ItemInstance("livingWoodBow", 1)
        ),
        new Recipe(
          {
            livingWood: 10,
            vine: 10,
            ironBar: 5,
            venom: 5,
            goldBar: 1,
          },
          new ItemInstance("livingWoodLongSword", 1)
        ),
        new Recipe(
          {
            goldBar: 5,
            livingWood: 1,
            horseshoe: 1,
          },
          new ItemInstance("amuletOfTheCentaur", 1)
        ),
        new Recipe(
          {
            treantSap: 8,
            goldBar: 5,
            livingWood: 5,
            livingStone: 1,
          },
          new ItemInstance("woodlandHorn", 1)
        ),
        new Recipe(
          {
            treantSap: 25,
            vine: 20,
            livingWood: 10,
          },
          new ItemInstance("treantMask", 1)
        ),
        new Recipe(
          {
            livingWood: 25,
            vine: 10,
            livingStone: 5,
            treantSap: 2,
          },
          new ItemInstance("sequoia", 1)
        ),
        new Recipe(
          {
            mushroom: 1,
            ember: 1,
            coal: 3,
          },
          new ItemInstance("bubbleShroom", 1)
        ),
        new Recipe(
          {
            bubbleShroom: 5,
            krakenShellFragment: 3,
            demonScale: 5,
          },
          new ItemInstance("implantableGills", 1)
        ),
        new Recipe(
          {
            livingStone: 10,
            livingWood: 10,
            golemCore: 1,
            enchantingSpirit: 1,
          },
          new ItemInstance("pocketGolem", 1)
        ),
        new Recipe(
          {
            fungalBackpack: 1,
            ember: 5,
            dragonScale: 4,
            krakenShellFragment: 4,
            wyvernHeart: 1,
          },
          new ItemInstance("wingedBackpack", 1)
        ),
        new Recipe(
          {
            ice: 25,
            livingWood: 10,
            giantTooth: 8,
          },
          new ItemInstance("blizzard", 1)
        ),
        new Recipe(
          {
            ice: 50,
            ironBar: 40,
            frozenCrystal: 10,
          },
          new ItemInstance("wintersBreath", 1)
        ),
        new Recipe(
          {
            ice: 30,
            frozenCrystal: 10,
            yetiFur: 5,
            ironBar: 5,
          },
          new ItemInstance("mammoth", 1)
        ),
        new Recipe(
          {
            giantTooth: 10,
            ice: 10,
            ironBar: 5,
            goldBar: 5,
          },
          new ItemInstance("giantCrown", 1)
        ),
        new Recipe(
          {
            ice: 80,
            giantTooth: 10,
            frozenCrystal: 5,
            yetiFur: 5,
          },
          new ItemInstance("glacier", 1)
        ),
        new Recipe(
          {
            yetiFur: 15,
            leather: 10,
          },
          new ItemInstance("yetiBoots", 1)
        ),
        new Recipe(
          {
            yetiSkull: 1,
            yetiFur: 25,
          },
          new ItemInstance("yetiHead", 1)
        ),
        new Recipe(
          {
            ice: 50,
          },
          new ItemInstance("frozenChain", 1)
        ),
        // Keep the teleport scrolls at the end
        new Recipe(
          {
            paper: 1,
            money: 40,
            ectoplasm: 1,
          },
          new ItemInstance("returnScroll", 2)
        ),
        new Recipe(
          {
            paper: 1,
            ironOre: 1,
            coal: 1,
          },
          new ItemInstance("teleportScroll3", 2)
        ),
        new Recipe(
          {
            paper: 1,
            silk: 1,
            nightmare: 1,
          },
          new ItemInstance("teleportScroll5", 2)
        ),
        new Recipe(
          {
            paper: 1,
            livingStone: 1,
            ashes: 1,
          },
          new ItemInstance("teleportScroll7", 2)
        ),
        new Recipe(
          {
            paper: 1,
            ink: 1,
            enchantingSpirit: 1,
          },
          new ItemInstance("teleportScroll9", 2)
        ),
        new Recipe(
          {
            paper: 1,
            ember: 1,
            dragonScale: 1,
            krakenShellFragment: 1,
          },
          new ItemInstance("teleportScroll11", 2)
        ),
      ])
    ),
  },
  mystic: {
    name: "Mystic",
    interact: async (entity, player, interaction, action) => {
      if (
        player.abilityScoreIncreases <= 0 &&
        (!interaction || (action !== "reset" && action !== "leave"))
      ) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          'The Mystic does not look at you. "Come back when you\'re ready," they say. (You have no ability score increases left.)'
        );
        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "leave",
              text: "Goodbye",
            },
            {
              id: "reset",
              text: "Reset Ability Scores",
            },
          ],
        };
      }

      const increaseActions = [
        {
          id: "strength",
          text: "Increase Strength",
        },
        {
          id: "constitution",
          text: "Increase Constitution",
        },
        {
          id: "intelligence",
          text: "Increase Intelligence",
        },
        {
          id: "reset",
          text: "Reset Ability Scores",
        },
        {
          id: "leave",
          text: "Goodbye",
        },
      ];

      if (!interaction) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          `The mystic looks at you with a knowing gaze and beckons towards the night sky. 
          You feel a strange energy in the air, as if the stars themselves are waiting for 
          you to make a choice. You have ${
            player.abilityScoreIncreases
          } ability score increases left. 
          Constitution grants +5 health, strength grants +10 kg carrying capacity and +${
            BONUS_FROM_STRENGTH * 100
          }% damage, and 
          intelligence improves abilities by ${BONUS_FROM_INTELLIGENCE * 100}%.`
        );

        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: increaseActions,
        };
      }

      if (action === "leave") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "The mystic stares into the night sky as you leave."
        );
        return undefined;
      }

      if (action === "reset") {
        for (const score of Object.values(AbilityScore)) {
          player.abilityScoreIncreases += player.abilityScores[score];
          player.abilityScores[score] = 0;
        }

        player.health = player.getMaxHealth();

        getIo().sendMsgToPlayer(
          player._id.toString(),
          `The mystic waves their hand and resets your ability scores. 
          You have ${player.abilityScoreIncreases} ability score increases left.`
        );

        return {
          ...interaction,
          actions: increaseActions,
        };
      }

      let abilityScore: AbilityScore | undefined;
      switch (action) {
        case "strength":
          abilityScore = AbilityScore.Strength;
          break;
        case "constitution":
          abilityScore = AbilityScore.Constitution;
          break;
        case "intelligence":
          abilityScore = AbilityScore.Intelligence;
          break;
        default:
          getIo().sendMsgToPlayer(
            player._id.toString(),
            "The mystic looks confused."
          );
          return interaction;
      }

      player.abilityScores[abilityScore] += 1;
      player.abilityScoreIncreases--;

      if (abilityScore === AbilityScore.Constitution) {
        player.health = Math.min(
          player.health + player.getHealthBonusFromConstitution(),
          player.getMaxHealth()
        );
      }

      getIo().sendMsgToPlayer(
        player._id.toString(),
        `The mystic increases your ${abilityScore} by 1. You now have ${player.getAbilityScore(
          abilityScore
        )} ${abilityScore} and ${
          player.abilityScoreIncreases
        } ability score increases left.`
      );

      getIo().updateGameState(player._id.toString());

      savePlayer(player);

      return {
        ...interaction,
        actions:
          player.abilityScoreIncreases > 0
            ? increaseActions
            : [
                {
                  id: "leave",
                  text: "Goodbye",
                },
                {
                  id: "reset",
                  text: "Reset Ability Scores",
                },
              ],
      };
    },
  },
  tavernKeeper: {
    name: "Tavern Keeper",
    interact: async (entity, player, interaction, action) => {
      if (!interaction) {
        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "rent",
              text: `Rent Room (${items["money"].getName} x5, restores health)`,
            },
            {
              id: "leave",
              text: "Leave Tavern",
            },
          ],
        };
      }

      if (action === "rent") {
        if (player.inventory.getCountById("money") < 5) {
          getIo().sendMsgToPlayer(
            player._id.toString(),
            "You don't have enough money to rent a room."
          );
          return interaction;
        }

        player.inventory.removeById("money", 5);
        player.health = player.getMaxHealth();

        savePlayer(player);

        const io = getIo();
        io.sendMsgToPlayer(
          player._id.toString(),
          "\"Here's the key. Room's upstairs,\" the tavern keeper says."
        );
        io.sendMsgToPlayer(
          player._id.toString(),
          "You rest for several hours. Your health is fully restored."
        );
        io.updateGameState(player._id.toString());

        return undefined;
      }

      if (action === "leave") {
        getIo().sendMsgToPlayer(player._id.toString(), "You walk away.");
        return undefined;
      }

      return interaction;
    },
  },
  junkCollector: {
    name: "Junk Collector",
    interact: async (entity, player, interaction, action) => {
      const recipes = new RecipeGroup(
        player
          .getCraftingInventory()
          .getItems()
          .filter((i) => i.definitionId !== "money")
          .sort((a, b) =>
            getFromOptionalFunc(items[a.definitionId].getSellValue, a) >
            getFromOptionalFunc(items[b.definitionId].getSellValue, b)
              ? -1
              : 1
          )

          .map(
            (item) =>
              new Recipe(
                { [item.definitionId]: 1 },
                new ItemInstance(
                  "money",
                  getFromOptionalFunc(
                    items[item.definitionId].getSellValue,
                    item
                  )
                )
              )
          )
      );

      const func = craftingInteraction("Sell Items", recipes);

      return func(entity, player, interaction, action);
    },
  },
  trader: {
    name: "Trader",
    interact: shopInteraction,
  },
  banker: {
    name: "Banker",
    canInteract: (entity, player) =>
      player.vault.level < vaultLevelling.length - 1,
    interact: async (entity, player, interaction, action) => {
      const nextVaultLevel = player.vault.level + 1;
      const nextVaultLevelStats = vaultLevelling[nextVaultLevel];

      const inventory = player.getCraftingInventory();
      const playerMoney = inventory.getCountById("money");

      const io = getIo();

      if (!interaction) {
        io.sendMsgToPlayer(
          player._id.toString(),
          `"Welcome to the bank! Your vault is currently at level ${
            player.vault.level
          } and has a capacity of ${
            vaultLevelling[player.vault.level].maxWeight
          } kg."
          `
        );

        if (nextVaultLevel >= vaultLevelling.length) {
          io.sendMsgToPlayer(
            player._id.toString(),
            "Your vault is already at the maximum level."
          );
          return undefined;
        } else {
          io.sendMsgToPlayer(
            player._id.toString(),
            `You can upgrade it to level ${nextVaultLevel} for ${nextVaultLevelStats.price} ${items["money"].getName},
            which will increase your vault's maximum weight to ${nextVaultLevelStats.maxWeight} kg.`
          );
        }

        if (playerMoney < nextVaultLevelStats.price) {
          io.sendMsgToPlayer(
            player._id.toString(),
            `You only have ${playerMoney} ${
              items["money"].getName
            }, which is not enough to upgrade your vault. 
            You need ${nextVaultLevelStats.price - playerMoney} more ${
              items["money"].getName
            }.`
          );
        }

        const actions = [
          {
            id: "leave",
            text: "Goodbye",
          },
        ];

        if (playerMoney >= nextVaultLevelStats.price) {
          actions.unshift({
            id: "upgrade",
            text: "Upgrade Vault",
          });
        }

        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions,
        };
      }

      if (action === "leave") {
        io.sendMsgToPlayer(player._id.toString(), "You walk away.");
        return undefined;
      }

      if (action === "upgrade") {
        if (playerMoney < nextVaultLevelStats.price) {
          io.sendMsgToPlayer(
            player._id.toString(),
            `You only have ${playerMoney} ${
              items["money"].getName
            }, which is not enough to upgrade your vault. 
            You need ${nextVaultLevelStats.price - playerMoney} more ${
              items["money"].getName
            }.`
          );
          return interaction;
        }

        inventory.removeById("money", nextVaultLevelStats.price);
        player.vault.level = nextVaultLevel;
        player.vault.recalculateVaultSize();

        savePlayer(player);

        io.sendMsgToPlayer(
          player._id.toString(),
          `Your vault has been upgraded to level ${nextVaultLevel + 1}. 
          Your vault's maximum weight is now ${
            nextVaultLevelStats.maxWeight
          } kg.`
        );

        io.updateGameState(player._id.toString());

        return undefined;
      }

      return interaction;
    },
  },
  vault: {
    name: "Vault",
    interact: async (entity, player, interaction, action) => {
      player.vault.recalculateVaultSize();

      return inventoryInteraction(
        entity,
        player,
        interaction,
        action,
        player.vault.inventory,
        "Vault"
      );
    },
  },
  instructor: {
    name: "Instructor",
    interact: async (entity, player, interaction, action) => {
      const interactionTemplate: Interaction = {
        entityId: entity._id,
        type: "logOnly",
        state: undefined,
        actions: [
          {
            id: "leave",
            text: "Goodbye",
          },
          {
            id: "basics",
            text: "Basics",
          },
          {
            id: "statuses",
            text: "Status Effects",
          },
          {
            id: "reforges",
            text: "Reforges",
          },
        ],
      };

      if (!interaction) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          'The instructor looks at you and says, "What do you want to know about?"'
        );

        return interactionTemplate;
      }

      if (action === "leave") return undefined;

      if (action === "basics") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          `Enter the dungeon at the dungeon entrance. Keep your location and combat menus open. 
          Use the interact button at the bottom of your screen to loot corpses. Be sure to explore the town!`
        );
        return interactionTemplate;
      }

      if (action === "statuses") {
        const statuses = Object.entries(statusEffects).map(
          ([id, status]) =>
            `- ${status.name} (1): ${getFromOptionalFunc(
              status.getDescription,
              new StatusEffectInstance(id as StatusEffectId, 1, new Date())
            )}`
        );

        const msg = `Status Effects:\n${statuses.join("\n")}`;
        getIo().sendMsgToPlayer(player._id.toString(), msg);

        return interactionTemplate;
      }

      if (action === "reforges") {
        const reforgeMessages = Object.values(reforges).map(
          (reforge) =>
            `- ${reforge.name} (type: ${reforge.type}, weight: ${
              reforge.weight
            }): ${getFromOptionalFunc(
              reforge.getDescription,
              player,
              new ItemInstance("rustySword", 1)
            )}`
        );

        const msg = `Reforges:\n${reforgeMessages.join("\n")}`;
        getIo().sendMsgToPlayer(player._id.toString(), msg);

        return interactionTemplate;
      }

      return interactionTemplate;
    },
  },
  menhir: {
    name: "Menhir",
    canInteract(entity, player) {
      return player.guildId !== undefined;
    },
    interact: async (entity, player, interaction, action) => {
      if (!interaction) {
        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "getStone",
              text: "Get Guild Stone",
            },
            {
              id: "leaveGuild",
              text: "Leave Guild",
            },
            {
              id: "leave",
              text: "Leave Menhir",
            },
          ],
        };
      }

      const guild = await Guild.fromId(player.guildId!);
      if (!guild) return;

      if (action === "getStone") {
        player.inventory.add(
          new ItemInstance("guildStone", 1, undefined, guild._id, guild.name)
        );

        getIo().sendMsgToPlayer(
          player._id.toString(),
          `You receive a guild stone. Give the stone to another player to invite them to your guild.`
        );

        return interaction;
      }

      if (action === "leaveGuild") {
        guild.members.splice(
          guild.members.findIndex((m) => m.equals(player._id))
        );

        if (guild.owner?.equals(player._id)) {
          guild.owner = guild.members.length ? guild.members[0] : undefined;
        }

        player.guildId = undefined;

        getIo().sendMsgToPlayer(
          player._id.toString(),
          `You have left the guild ${guild.name}.`
        );

        savePlayer(player);
        Guild.upsert(guild);

        return undefined;
      }

      if (action === "leave") {
        getIo().sendMsgToPlayer(player._id.toString(), "You walk away.");
        return undefined;
      }
    },
  },
  reforgeAnvil: {
    name: "Reforge Anvil",
    interact: async (entity, player, interaction, action) =>
      reforgeInteraction(entity, player, interaction, action, "Reforge Anvil"),
  },
  lockedCoffin: {
    name: "Locked Sarcophagus",
    interact: async (entity, player, interaction, action) => {
      if (player.inventory.getById("skeletonKey")?.amount === 0) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "This sarcophagus is locked, but you have no key."
        );
        return undefined;
      }

      if (!interaction) {
        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "openCoffin",
              text: "Unlock Coffin",
            },
            {
              id: "leave",
              text: "Leave Coffin",
            },
          ],
        };
      }

      if (action === "leave") {
        getIo().sendMsgToPlayer(player._id.toString(), "You walk away.");
        return undefined;
      }

      player.inventory.removeById("skeletonKey", 1);

      getIo().sendMsgToPlayer(
        player._id.toString(),
        "You unlock the coffin and come face to face with an ancient hero!"
      );

      const summon = new CreatureInstance("skeletonHero", entity.location);

      const location = locations[entity.location];
      location.entities.add(summon);
      location.entities.delete(entity);

      return undefined;
    },
  },
};

export default entities;
