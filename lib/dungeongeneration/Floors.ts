import { WeightedTable } from "lib/types/WeightedTable";
import { Encounter, FloorDefinition } from "./types";
import { randomContainer } from "./populateDungeon";
import { ItemId } from "lib/gamedata/items";
import { PlayerInstance } from "lib/types/entities/player";

const floors: Record<string, FloorDefinition> = {
  sewers: {
    name: "Sewers",
    depth: 0,
    visualizerColor: "#2F4F4F",
    layoutGenerationOptions: {
      roomChance: 0.5,
      connectionChance: 0.3,
      width: [10, 15],
      length: [10, 15],
      roomCount: [15, 30],
      exitCount: [2, 3],
    },
    populationOptions: {
      encounterChance: 0.6,
      maxEncounters: 2,
      encounters: new WeightedTable<Encounter>([
        {
          item: "skeleton",
          amount: 1,
          weight: 0.6,
        },
        {
          item: "zombie",
          amount: 1,
          weight: 0.8,
        },
        {
          item: "slime",
          amount: [1, 3],
          weight: 1,
        },
        {
          item: "slimeSplitter",
          amount: 1,
          weight: 1,
        },
        {
          item: "rat",
          amount: [1, 3],
          weight: 0.8,
        },
        {
          item: "giantRat",
          amount: 1,
          weight: 0.5,
        },
        {
          item: randomContainer(
            "Slime Puddle",
            new WeightedTable([
              {
                item: "slime",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "slimeEgg",
                amount: 1,
                weight: 0.3,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.4,
        },
        {
          item: randomContainer(
            "Moldy Corpse",
            new WeightedTable([
              {
                item: "rottenFlesh",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "bone",
                amount: [1, 2],
                weight: 0.5,
              },
              {
                item: "slime",
                amount: 1,
                weight: 0.3,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.4,
        },
      ]),
    },
  },
  caves: {
    name: "Caves",
    depth: 1,
    visualizerColor: "#4682B4",
    layoutGenerationOptions: {
      roomChance: 0.7,
      connectionChance: 0.5,
      width: [8, 14],
      length: [8, 14],
      roomCount: [25, 50],
      exitCount: [4, 5],
    },
    populationOptions: {
      encounterChance: 0.5,
      maxEncounters: 2,
      encounters: new WeightedTable<Encounter>([
        {
          item: "skeleton",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "zombie",
          amount: [1, 2],
          weight: 0.8,
        },
        {
          item: "troll",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "ghost",
          amount: 1,
          weight: 0.2,
        },
        {
          item: "rat",
          amount: [1, 3],
          weight: 0.3,
        },
        {
          item: "giantRat",
          amount: 1,
          weight: 0.3,
        },
        {
          item: randomContainer(
            "Ore Deposit",
            new WeightedTable([
              {
                item: "salt",
                amount: [1, 5],
                weight: 1,
              },
              {
                item: "coal",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "ironOre",
                amount: [1, 5],
                weight: 1.2,
              },
              {
                item: "goldOre",
                amount: [1, 3],
                weight: 0.8,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.3,
        },
      ]),
    },
  },
  crypts: {
    name: "Crypts",
    depth: 2,
    visualizerColor: "#8B4513",
    layoutGenerationOptions: {
      roomChance: 0.6,
      connectionChance: 0.4,
      width: [6, 12],
      length: [6, 12],
      roomCount: [20, 40],
      exitCount: [3, 4],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "skeleton",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "zombie",
          amount: 1,
          weight: 0.8,
        },
        {
          item: "ghost",
          amount: 1,
          weight: 0.6,
        },
        {
          item: "rat",
          amount: [1, 3],
          weight: 0.4,
        },
        {
          item: "giantRat",
          amount: 1,
          weight: 0.2,
        },
        {
          item: randomContainer(
            "Bone Pile",
            new WeightedTable([
              {
                item: "bone",
                amount: [1, 3],
                weight: 1,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.3,
        },
      ]),
    },
  },
  mines: {
    name: "Mines",
    depth: 3,
    visualizerColor: "#A9A9A9",
    layoutGenerationOptions: {
      roomChance: 0.6,
      connectionChance: 0.4,
      width: [10, 16],
      length: [10, 16],
      roomCount: [20, 40],
      exitCount: [3, 4],
    },
    populationOptions: {
      encounterChance: 0.7,
      maxEncounters: 2,
      encounters: new WeightedTable<Encounter>([
        {
          item: "lostAdventurer",
          amount: 1,
          weight: 1,
        },
        {
          item: "goblin",
          amount: [2, 3],
          weight: 1,
        },
        {
          item: "goblinShaman",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "hobgoblin",
          amount: [1, 2],
          weight: 0.8,
        },
        {
          item: "troll",
          amount: 1,
          weight: 0.8,
        },
        {
          item: "rat",
          amount: [1, 3],
          weight: 0.5,
        },
        {
          item: "giantRat",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "saltGolem",
          amount: 1,
          weight: 0.3,
        },
        {
          item: randomContainer(
            "Ore Deposit",
            new WeightedTable([
              {
                item: "salt",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "coal",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "ironOre",
                amount: [1, 5],
                weight: 1.2,
              },
              {
                item: "goldOre",
                amount: [1, 3],
                weight: 0.8,
              },
            ]),
            [1, 3]
          ),
          amount: 1,
          weight: 0.6,
        },
        {
          item: randomContainer(
            "Mine Cart",
            new WeightedTable([
              {
                item: "coal",
                amount: [1, 5],
                weight: 1,
              },
              {
                item: "money",
                amount: [5, 20],
                weight: 0.3,
              },
              {
                item: "ironBar",
                amount: [1, 3],
                weight: 0.5,
              },
              {
                item: "goldBar",
                amount: [1, 2],
                weight: 0.2,
              },
            ])
          ),
          amount: 1,
          weight: 0.2,
        },
      ]),
    },
  },
  fungalCaverns: {
    name: "Fungal Caverns",
    depth: 4,
    visualizerColor: "#228B22",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.6,
      width: [12, 18],
      length: [12, 18],
      roomCount: [30, 60],
      exitCount: [4, 5],
    },
    populationOptions: {
      encounterChance: 0.7,
      maxEncounters: 2,
      encounters: new WeightedTable<Encounter>([
        {
          item: "fungalZombie",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "fungalTroll",
          amount: 1,
          weight: 1,
        },
        {
          item: "zombie",
          amount: [1, 2],
          weight: 0.25,
        },
        {
          item: "troll",
          amount: 1,
          weight: 0.25,
        },
        {
          item: "sentientFungus",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "fungalCore",
          amount: 1,
          weight: 0.3,
        },
        {
          item: randomContainer(
            "Mushroom Patch",
            new WeightedTable([
              {
                item: "mushroom",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "spore",
                amount: [1, 4],
                weight: 0.5,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.4,
        },
      ]),
    },
  },
  ruins: {
    name: "Ruins",
    depth: 5,
    visualizerColor: "#B8860B",
    layoutGenerationOptions: {
      roomChance: 0.5,
      connectionChance: 0.3,
      width: [14, 20],
      length: [14, 20],
      roomCount: [35, 70],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.6,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "ghost",
          amount: [1, 2],
          weight: 0.5,
        },
        {
          item: "wraith",
          amount: 1,
          weight: 0.3,
        },
        {
          item: "lostAdventurer",
          amount: 1,
          weight: 1,
        },
        {
          item: "troll",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "ancientTroll",
          amount: 1,
          weight: 0.2,
        },
        {
          item: "spider",
          amount: [1, 3],
          weight: 1,
        },
        {
          item: "spiderSpitter",
          amount: 1,
          weight: 0.5,
        },
        {
          item: randomContainer(
            "Ancient Chest",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [25, 50],
                weight: 1,
              },
              {
                item: "ironDagger",
                amount: [1, 2],
                weight: 0.5,
              },
              {
                item: "silk",
                amount: [5, 10],
                weight: 0.5,
              },
              {
                item: "boneNecklace",
                amount: 1,
                weight: 0.5,
              },
              {
                item: "wakingDust",
                amount: [1, 2],
                weight: 0.3,
              },
              {
                item: "dreamingDust",
                amount: [1, 2],
                weight: 0.3,
              },
              {
                item: "spectralShield",
                amount: 1,
                weight: 0.2,
              },
              {
                item: "unnaturalHeart",
                amount: 1,
                weight: 0.2,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
  goblinColonies: {
    name: "Goblin Colonies",
    depth: 6,
    visualizerColor: "#f29d1d",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.8,
      width: [16, 24],
      length: [16, 24],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "goblin",
          amount: [2, 4],
          weight: 2,
        },
        {
          item: "hobgoblin",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "goblinShaman",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "masterGoblinShaman",
          amount: 1,
          weight: 1,
        },
        {
          item: "goblinWarrior",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "hobgoblinWarrior",
          amount: 1,
          weight: 1,
        },
        {
          item: "goblinInventor",
          amount: 1,
          weight: 0.8,
        },
        {
          item: randomContainer(
            "Barrel",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [25, 50],
                weight: 2,
              },
              {
                item: "leather",
                amount: [2, 4],
                weight: 0.5,
              },
              {
                item: "bottle",
                amount: [2, 3],
                weight: 0.5,
              },
              {
                item: "rope",
                amount: [3, 5],
                weight: 0.5,
              },
              {
                item: "healthPotion",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "slimeJar",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "hordeFlute",
                amount: 1,
                weight: 0.2,
              },
              {
                item: "fireballRing",
                amount: 1,
                weight: 0.1,
              },
            ]),
            [1, 3]
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
  catacombs: {
    name: "Catacombs",
    depth: 7,
    visualizerColor: "#888888",
    layoutGenerationOptions: {
      roomChance: 0.9,
      connectionChance: 0.6,
      width: [8, 16],
      length: [20, 28],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "skeletonWarrior",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "skeletonBonecaller",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "cryptGuardGolem",
          amount: 1,
          weight: 0.3,
        },
        {
          item: "wraith",
          amount: [2, 3],
          weight: 1,
        },
        {
          item: "banshee",
          amount: 1,
          weight: 1,
        },
        {
          item: "lockedCoffin",
          amount: 1,
          weight: 0.2,
        },
        {
          item: randomContainer(
            "Ancient Chest",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [50, 100],
                weight: 1,
              },
              {
                item: "livingStone",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "ashes",
                amount: [1, 3],
                weight: 1,
              },
              {
                item: "wakingDust",
                amount: [1, 2],
                weight: 0.5,
              },
              {
                item: "dreamingDust",
                amount: [1, 2],
                weight: 0.5,
              },
            ])
          ),
          amount: 2,
          weight: 0.1,
        },
      ]),
    },
  },
  overgrownCaverns: {
    name: "Overgrown Caverns",
    depth: 8,
    visualizerColor: "#06c225",
    layoutGenerationOptions: {
      roomChance: 0.6,
      connectionChance: 0.3,
      width: [15, 22],
      length: [15, 22],
      roomCount: [40, 70],
      exitCount: [5, 6],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "fungalTroll",
          amount: [1, 2],
          weight: 0.5,
        },
        {
          item: "overgrownGolem",
          amount: 1,
          weight: 1,
        },
        {
          item: "writhingVines",
          amount: [1, 2],
          weight: 1.5,
        },
        {
          item: "centaur",
          amount: 1,
          weight: 0.75,
        },
        {
          item: "treant",
          amount: 1,
          weight: 1,
        },
        {
          item: randomContainer(
            "Living Wood Chest",
            new WeightedTable<ItemId>([
              {
                item: "livingWood",
                amount: [2, 3],
                weight: 1,
              },
              {
                item: "vine",
                amount: [2, 4],
                weight: 1,
              },
              {
                item: "horseshoe",
                amount: [1, 2],
                weight: 0.5,
              },
              {
                item: "spore",
                amount: [2, 4],
                weight: 0.2,
              },
              {
                item: "livingWoodBow",
                amount: 1,
                weight: 0.2,
              },
              {
                item: "livingWoodLongSword",
                amount: 1,
                weight: 0.2,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
  floodedCaves: {
    name: "Flooded Caves",
    depth: 9,
    visualizerColor: "#888888",
    layoutGenerationOptions: {
      roomChance: 0.65,
      connectionChance: 0.9,
      width: [20, 28],
      length: [20, 28],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    tick: (entity, floor, deltaTime) => {
      if (
        entity instanceof PlayerInstance &&
        !entity.statusEffects.some((se) => se.definitionId === "suffocating")
      ) {
        // Apply suffocation damage
        entity.addStatusEffect({
          id: "suffocating",
          strength: 5,
          duration: deltaTime,
        });
      }
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "piranha",
          amount: [3, 5],
          weight: 1,
        },
        {
          item: "siren",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "giantSquid",
          amount: 2,
          weight: 0.5,
        },
        {
          item: "bonecrusherCrab",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "octoCrab",
          amount: 1,
          weight: 0.5,
        },
        {
          item: "hordecallerCrab",
          amount: 1,
          weight: 0.5,
        },
        {
          item: randomContainer(
            "Sunken Chest",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [50, 100],
                weight: 1,
              },
              {
                item: "salt",
                amount: [1, 3],
                weight: 0.5,
              },
              {
                item: "coal",
                amount: [1, 3],
                weight: 0.5,
              },
              {
                item: "ironOre",
                amount: [1, 5],
                weight: 0.8,
              },
              {
                item: "goldOre",
                amount: [1, 3],
                weight: 0.5,
              },
              {
                item: "livingStone",
                amount: [1, 2],
                weight: 0.3,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.2,
        },
      ]),
    },
  },
  frozenCaves: {
    name: "Frozen Caves",
    depth: 10,
    visualizerColor: "#888888",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.8,
      width: [16, 24],
      length: [16, 24],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "yeti",
          amount: 1,
          weight: 1,
        },
        {
          item: "frostElemental",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "iceGolem",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "frostGiant",
          amount: 1,
          weight: 0.5,
        },
        {
          item: randomContainer(
            "Ice Chunk",
            new WeightedTable<ItemId>([
              {
                item: "ice",
                amount: [2, 4],
                weight: 1,
              },
            ]),
            1
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
  volcanicTunnels: {
    name: "Volcanic Tunnels",
    depth: 11,
    visualizerColor: "#888888",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.8,
      width: [16, 24],
      length: [16, 24],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "goblin",
          amount: [1, 3],
          weight: 2,
        },
        {
          item: "goblinShaman",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "hobgoblin",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: randomContainer(
            "Barrel",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [25, 50],
                weight: 2,
              },
              {
                item: "leather",
                amount: [2, 4],
                weight: 0.5,
              },
              {
                item: "bottle",
                amount: [2, 3],
                weight: 0.5,
              },
              {
                item: "rope",
                amount: [3, 5],
                weight: 0.5,
              },
              {
                item: "healthPotion",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "slimeJar",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "hordeFlute",
                amount: 1,
                weight: 0.2,
              },
              {
                item: "fireballRing",
                amount: 1,
                weight: 0.1,
              },
            ]),
            [1, 3]
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
  spectralPassage: {
    name: "Spectral Passage",
    depth: 12,
    visualizerColor: "#888888",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.8,
      width: [16, 24],
      length: [16, 24],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "goblin",
          amount: [1, 3],
          weight: 2,
        },
        {
          item: "goblinShaman",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "hobgoblin",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: randomContainer(
            "Barrel",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [25, 50],
                weight: 2,
              },
              {
                item: "leather",
                amount: [2, 4],
                weight: 0.5,
              },
              {
                item: "bottle",
                amount: [2, 3],
                weight: 0.5,
              },
              {
                item: "rope",
                amount: [3, 5],
                weight: 0.5,
              },
              {
                item: "healthPotion",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "slimeJar",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "hordeFlute",
                amount: 1,
                weight: 0.2,
              },
              {
                item: "fireballRing",
                amount: 1,
                weight: 0.1,
              },
            ]),
            [1, 3]
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
  arcaneGrottos: {
    name: "Arcane Grottos",
    depth: 13,
    visualizerColor: "#888888",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.8,
      width: [16, 24],
      length: [16, 24],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "goblin",
          amount: [1, 3],
          weight: 2,
        },
        {
          item: "goblinShaman",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "hobgoblin",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: randomContainer(
            "Barrel",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [25, 50],
                weight: 2,
              },
              {
                item: "leather",
                amount: [2, 4],
                weight: 0.5,
              },
              {
                item: "bottle",
                amount: [2, 3],
                weight: 0.5,
              },
              {
                item: "rope",
                amount: [3, 5],
                weight: 0.5,
              },
              {
                item: "healthPotion",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "slimeJar",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "hordeFlute",
                amount: 1,
                weight: 0.2,
              },
              {
                item: "fireballRing",
                amount: 1,
                weight: 0.1,
              },
            ]),
            [1, 3]
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
  theRift: {
    name: "The Rift",
    depth: 14,
    visualizerColor: "#888888",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.8,
      width: [16, 24],
      length: [16, 24],
      roomCount: [50, 80],
      exitCount: [6, 7],
    },
    populationOptions: {
      encounterChance: 0.8,
      maxEncounters: 3,
      encounters: new WeightedTable<Encounter>([
        {
          item: "goblin",
          amount: [1, 3],
          weight: 2,
        },
        {
          item: "goblinShaman",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: "hobgoblin",
          amount: [1, 2],
          weight: 1,
        },
        {
          item: randomContainer(
            "Barrel",
            new WeightedTable<ItemId>([
              {
                item: "money",
                amount: [25, 50],
                weight: 2,
              },
              {
                item: "leather",
                amount: [2, 4],
                weight: 0.5,
              },
              {
                item: "bottle",
                amount: [2, 3],
                weight: 0.5,
              },
              {
                item: "rope",
                amount: [3, 5],
                weight: 0.5,
              },
              {
                item: "healthPotion",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "slimeJar",
                amount: [1, 2],
                weight: 0.2,
              },
              {
                item: "hordeFlute",
                amount: 1,
                weight: 0.2,
              },
              {
                item: "fireballRing",
                amount: 1,
                weight: 0.1,
              },
            ]),
            [1, 3]
          ),
          amount: 1,
          weight: 0.1,
        },
      ]),
    },
  },
};

export default floors;
