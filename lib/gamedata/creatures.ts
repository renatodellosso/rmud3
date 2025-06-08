import { AbilityScore, DamageType } from "lib/types/types";
import { CreatureDefinition, CreatureInstance } from "../types/creature";
import { AbilityWithSource } from "lib/types/Ability";
import * as Abilities from "lib/gamedata/Abilities";
import * as CanTarget from "lib/gamedata/CanTarget";

// Only import on server side
let activateAbilityOnTick: (
    instance: CreatureInstance,
    deltaTime: number,
    abilitySelector: (
      creature: CreatureInstance
    ) => AbilityWithSource | undefined,
    skipIfLocationIsEmpty?: boolean
  ) => void,
  selectRandomAbility: (
    creature: CreatureInstance
  ) => AbilityWithSource | undefined;

if (typeof window === "undefined")
  import("lib/creatureutils").then((creatureutils) => {
    activateAbilityOnTick = creatureutils.activateAbilityOnTick;
    selectRandomAbility = creatureutils.selectRandomAbility;
  });

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
    intrinsicAbilities: [
      {
        name: "Taunt",
        getDescription: () => "Taunts all enemies in the room.",
        getCooldown: () => 1,
        getTargetCount: () => 0,
        canTarget: () => false,
        activate: (creature) => {
          return `${creature.name} taunts everyone in the room!`;
        },
      },
      Abilities.attack("Slap", "Slap an enemy.", 2, 1, DamageType.Bludgeoning, [
        CanTarget.isPlayer,
      ]),
    ],
    tick: (creature, delta) =>
      activateAbilityOnTick(creature, delta, selectRandomAbility),
  },
} as Record<string, CreatureDefinition>);

export default creatures;
