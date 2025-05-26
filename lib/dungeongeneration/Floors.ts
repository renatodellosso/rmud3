import { FloorDefinition } from "./types";

const floors: Record<string, FloorDefinition> = {
  sewers: {
    name: "Sewers",
    depth: 0,
    appearanceWeight: 1,
    blendChance: 0,
    visualizerColor: "#2F4F4F",
    generationOptions: {
      roomChance: 0.5,
      connectionChance: 0.3,
      width: [10, 15],
      length: [10, 15],
      roomCount: [15, 30],
      exitCount: [2, 3],
    },
  },
  catacombs: {
    name: "Catacombs",
    depth: 1,
    appearanceWeight: 1.5,
    blendChance: 0.4,
    visualizerColor: "#8B4513",
    generationOptions: {
      roomChance: 0.6,
      connectionChance: 0.4,
      width: [6, 12],
      length: [6, 12],
      roomCount: [20, 40],
      exitCount: [3, 4],
    },
  },
  caves: {
    name: "Caves",
    depth: 1,
    appearanceWeight: 1,
    blendChance: 0.4,
    visualizerColor: "#4682B4",
    generationOptions: {
      roomChance: 0.7,
      connectionChance: 0.5,
      width: [8, 14],
      length: [8, 14],
      roomCount: [25, 50],
      exitCount: [4, 5],
    },
  },
};

export default floors;
