import { AbilityScore, DamageType } from "lib/types/types";
import { CreatureDefinition, CreatureInstance } from "../types/creature";
import * as Abilities from "lib/gamedata/Abilities";
import * as CanTarget from "lib/gamedata/CanTarget";
import { activateAbilityOnTick, selectRandomAbility } from "lib/entityutils";
import { EntityDefinition, EntityInstance } from "lib/types/entity";

export type CreatureId =
  | "test"
  | "player"
  | "trainingDummy"
  | "zombie"
  | "skeleton";

export type EntityId = CreatureId | "corpse";

const entities: Record<EntityId, EntityDefinition> = {
  test: {
    name: "Test Creature",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 10,
    },
  } as CreatureDefinition,
  player: {
    name: "Player",
    health: 20,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
  } as CreatureDefinition,
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
      Abilities.attack(
        "Slap",
        "Slap an enemy.",
        0.5,
        3,
        DamageType.Bludgeoning,
        [CanTarget.isPlayer]
      ),
    ],
    tick: (creature, delta) =>
      activateAbilityOnTick(
        creature as CreatureInstance,
        delta,
        selectRandomAbility
      ),
  } as CreatureDefinition,
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
      activateAbilityOnTick(
        creature as CreatureInstance,
        delta,
        selectRandomAbility
      ),
  } as CreatureDefinition,
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
      activateAbilityOnTick(
        creature as CreatureInstance,
        delta,
        selectRandomAbility
      ),
  } as CreatureDefinition,
  corpse: {
    name: "Corpse",
  },
};

export default entities;
