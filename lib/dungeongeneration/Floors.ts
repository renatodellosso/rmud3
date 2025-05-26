import { FloorDefinition } from "./types";

const floors: Record<string, FloorDefinition> = {
  sewers: {
    name: "Sewers",
    depth: 0,
    appearanceWeight: 1,
    blendChance: 0,
    generationOptions: {
      roomChance: 0.5,
      connectionChance: 0.3,
      width: [5, 10],
      length: [5, 10],
      roomCount: [3, 6],
      exitCount: [2, 3],
    },
  },
  catacombs: {
    name: "Catacombs",
    depth: 1,
    appearanceWeight: 1,
    blendChance: 0.1,
    generationOptions: {
      roomChance: 0.6,
      connectionChance: 0.4,
      width: [6, 12],
      length: [6, 12],
      roomCount: [4, 8],
      exitCount: [3, 4],
    },
  },
};

export default floors;
