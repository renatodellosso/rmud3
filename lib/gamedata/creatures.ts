import { AbilityScore } from "lib/utilstypes";
import { CreatureDefinition } from "../types";

const creatures = Object.freeze({
  test: {
    name: "Test Creature",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 10,
    },
  },
  player: {
    name: "Player",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 10,
    },
  },
} satisfies Record<string, CreatureDefinition>);

export default creatures;
