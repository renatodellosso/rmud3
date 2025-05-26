import { Location } from "../types/types";

const locations = {
  test: {
    name: "Test Location",
    creatures: [],
    exits: new Set(),
  },
} as Record<string, Location>;

export default locations;
