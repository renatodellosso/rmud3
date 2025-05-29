import { Location } from "../types/types";

const locations = {
  docks: {
    name: "Docks",
    creatures: [],
    exits: new Set(),
  },
} as Record<string, Location>;

export default locations;
