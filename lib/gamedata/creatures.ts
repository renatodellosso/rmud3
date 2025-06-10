import { AbilityScore, DamageType } from "lib/types/types";
import { CreatureDefinition } from "../types/creature";
import * as Abilities from "lib/gamedata/Abilities";
import * as CanTarget from "lib/gamedata/CanTarget";
import { activateAbilityOnTick, selectRandomAbility } from "lib/creatureutils";

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
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
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
  zombie: {
    name: "Zombie",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 1,
    },
    intrinsicAbilities: [
      Abilities.attack("Bite", "Bite an enemy.", 3, 1, DamageType.Piercing, [
        CanTarget.isPlayer,
      ]),
    ],
    tick: (creature, delta) =>
      activateAbilityOnTick(creature, delta, selectRandomAbility),
  },
  skeleton: {
    name: "Skeleton",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 4,
      [AbilityScore.Constitution]: 4,
      [AbilityScore.Intelligence]: 1,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slash",
        "Slash an enemy with a bone sword.",
        4,
        1,
        DamageType.Slashing,
        [CanTarget.isPlayer]
      ),
    ],
    tick: (creature, delta) =>
      activateAbilityOnTick(creature, delta, selectRandomAbility),
  },
} as Record<string, CreatureDefinition>);

export default creatures;
