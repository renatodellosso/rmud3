import { CreatureDefinition } from "../types";

const creatures = Object.freeze({
  "test": {
    name: "Test Creature",
    baseHealth: 10,
  }
} satisfies Record<string, CreatureDefinition>);

export default creatures;