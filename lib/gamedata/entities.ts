import { WeightedTable } from "lib/types/WeightedTable";
import { LootTable } from "lib/types/LootTable";
import AbilityScore from "lib/types/AbilityScore";
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
import { EntityDefinition } from "lib/types/entity";
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

export type CreatureId =
  | "player"
  | "trainingDummy"
  | "zombie"
  | "skeleton"
  | "slime"
  | "slimeSplitter"
  | "troll"
  | "fungalZombie"
  | "fungalTroll"
  | "sentientFungus"
  | "fungalCore"
  | "farulu"
  | "lostAdventurer"
  | "goblin"
  | "goblinShaman"
  | "hobgoblin"
  | "ghost"
  | "wraith"
  | "rat"
  | "giantRat"
  | "saltGolem"
  | "spider"
  | "spiderSpitter"
  | "ancientTroll";

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
  | "banker"
  | "vault"
  | "menhir"
  | "reforgeAnvil";

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
        getCooldown: () => 1,
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  slime: {
    name: "Slime",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slime",
        "Slime.",
        4,
        [{ amount: 1, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isPlayer] }
      ),
    ],
    xpValue: 5,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "slime",
            amount: [1, 4],
            weight: 1,
          },
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.1),
  },
  slimeSplitter: {
    name: "Splitter Slime",
    health: 35,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slime",
        "Slime.",
        4,
        [{ amount: 1, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.1),
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
  troll: {
    name: "Troll",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 1,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slam.",
        6,
        [{ amount: 5, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isPlayer] }
      ),
      Abilities.heal("Heal", "Recover a small amount of health.", 10, 5, {
        targetRestrictions: [CanTarget.isSelf],
      }),
    ],
    xpValue: 20,
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
            weight: 0.8,
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  saltGolem: {
    name: "Salt Golem",
    health: 35,
    abilityScores: {
      [AbilityScore.Strength]: 3,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 1,
    },
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        ]
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
        chance: 0.2,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        [{ amount: 2, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  fungalTroll: {
    name: "Fungal Troll",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 7,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slam.",
        5,
        [{ amount: 5, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  sentientFungus: {
    name: "Sentient Fungus",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 2,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attackWithStatusEffect(
        "Spore Injection",
        "Infest an enemy with spores.",
        4,
        [{ amount: 3, type: DamageType.Piercing }],
        [
          {
            id: "infested",
            strength: 5,
            duration: 5,
          },
        ],
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  fungalCore: {
    name: "Fungal Core",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 2,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 1,
    },
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  farulu: {
    name: "Farulu, Fungal Abomination",
    health: 50,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 10,
    },
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
      ),
      Abilities.attack(
        "Slam",
        "A simple bludgeoning attack.",
        5,
        [{ amount: 8, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isPlayer] }
      ),
      Abilities.attack(
        "Stab",
        "A simple piercing attack.",
        2.5,
        [{ amount: 4, type: DamageType.Piercing }],
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
      ),
    ],
    xpValue: 15,
    lootTable: new LootTable([
      {
        item: new WeightedTable<ItemId>([
          {
            item: "money",
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
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        ]),
        amount: 1,
        chance: 1,
      },
    ]),
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        ]),
        amount: 2,
        chance: 0.8,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  ghost: {
    name: "Ghost",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 1,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Haunt",
        "A spooky attack on the mind.",
        5,
        [{ amount: 5, type: DamageType.Psychic }],
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  wraith: {
    name: "Wraith",
    health: 45,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 4,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Haunt",
        "An invasive attack on the mind.",
        4,
        [{ amount: 9, type: DamageType.Psychic }],
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
        { targetRestrictions: [CanTarget.isPlayer] }
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
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  },
  ancientTroll: {
    name: "Ancient Troll",
    health: 60,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 3,
      [AbilityScore.Intelligence]: 1,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "A powerful slam attack.",
        4,
        [{ amount: 15, type: DamageType.Bludgeoning }],
        { targetRestrictions: [CanTarget.isPlayer] }
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
        ]
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
        0.5,
        selectRandomAbility,
        0.03
      )(entity, deltaTime);
    },
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
      ])
    ),
  },
  furnace: {
    name: "Furnace",
    interact: craftingInteraction(
      "Crafting at Furnace",
      new RecipeGroup([
        new Recipe({ coal: 1, ironOre: 3 }, new ItemInstance("ironBar", 1)),
        new Recipe({ rottenFlesh: 1 }, new ItemInstance("leather", 1)),
        new Recipe({ meat: 1, coal: 1 }, new ItemInstance("grilledMeat", 1)),
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
        new Recipe({ bone: 20 }, new ItemInstance("boneClub", 1)),
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
          you to make a choice. You have ${player.abilityScoreIncreases} ability score increases left. 
          Constitution grants +5 health, strength grants +10 kg carrying capacity, and intelligence improves
          abilities.`
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
              text: "Rent Room (5 gold, restores health)",
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
        player.inventory.items
          .filter((i) => i.definitionId !== "money")
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
  banker: {
    name: "Banker",
    canInteract: (entity, player) =>
      player.vault.level < vaultLevelling.length - 1,
    interact: async (entity, player, interaction, action) => {
      const nextVaultLevel = player.vault.level + 1;
      const nextVaultLevelStats = vaultLevelling[nextVaultLevel];
      const playerMoney = player.inventory.getCountById("money");

      const io = getIo();

      if (!interaction) {
        io.sendMsgToPlayer(
          player._id.toString(),
          `"Welcome to the bank! Your vault is currently at level ${
            player.vault.level + 1
          } and has a capacity of ${
            vaultLevelling[player.vault.level].maxWeight
          } kg.
          You can upgrade it to level ${nextVaultLevel + 1} for ${
            nextVaultLevelStats.price
          } ${items["money"].getName},
          which will increase your vault's maximum weight to ${
            nextVaultLevelStats.maxWeight
          } kg.`
        );

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

        player.inventory.removeById("money", nextVaultLevelStats.price);
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
    interact: async (entity, player, interaction, action) =>
      inventoryInteraction(
        entity,
        player,
        interaction,
        action,
        player.vault.inventory,
        "Vault"
      ),
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
        player.inventory.add({
          definitionId: "guildStone",
          amount: 1,
          guildId: player.guildId,
          guildName: guild.name,
        } as ItemInstance);

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
};

export default entities;
