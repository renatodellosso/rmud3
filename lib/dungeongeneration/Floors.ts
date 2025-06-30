import { WeightedTable } from "lib/types/WeightedTable";
import { Encounter, FloorDefinition } from "./types";
import { randomContainer } from "./populateDungeon";
import { ItemId } from "lib/gamedata/items";

const floors: Record<string, FloorDefinition> = {
  sewers: {
    name: "Sewers",
    depths: [0],
    appearanceWeight: 1,
    blendChance: 0,
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
          weight: 2,
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
  catacombs: {
    name: "Catacombs",
    depths: [1],
    appearanceWeight: 1.5,
    blendChance: 0.4,
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
  caves: {
    name: "Caves",
    depths: [0, 1],
    appearanceWeight: 1,
    blendChance: 0.4,
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
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.2,
        },
      ]),
    },
  },
  mines: {
    name: "Mines",
    depths: [1, 2],
    appearanceWeight: 1.6,
    blendChance: 0.5,
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
                amount: [1, 5],
                weight: 1,
              },
              {
                item: "coal",
                amount: [1, 3],
                weight: 1,
              },
            ]),
            [1, 2]
          ),
          amount: 1,
          weight: 0.4,
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
    depths: [2],
    appearanceWeight: 1.2,
    blendChance: 0.3,
    visualizerColor: "#228B22",
    layoutGenerationOptions: {
      roomChance: 0.8,
      connectionChance: 0.6,
      width: [12, 18],
      length: [12, 18],
      roomCount: [30, 60],
      exitCount: [5, 6],
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
    depths: [2, 3],
    appearanceWeight: 1.1,
    blendChance: 0.2,
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
            ])
          ),
          amount: 4,
          weight: 0.1,
        },
      ]),
    },
  },
};

export default floors;
