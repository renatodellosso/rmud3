import { AbilityScore } from "lib/types/types";
import { CreatureDefinition } from "../types/creature";

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
  trainingDummy: {
    name: "Training Dummy",
    health: 1000000000,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
  },
} as Record<string, CreatureDefinition>);

export default creatures;
