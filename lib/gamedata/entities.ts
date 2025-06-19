import { AbilityScore, DamageType, WeightedTable } from "lib/types/types";
import {
  CreatureDefinition,
  CreatureInstance,
} from "../types/entities/creature";
import * as Abilities from "lib/gamedata/Abilities";
import * as CanTarget from "lib/gamedata/CanTarget";
import { activateAbilityOnTick, selectRandomAbility } from "lib/entityutils";
import { EntityDefinition } from "lib/types/entity";
import { ItemId } from "./items";
import { getIo } from "lib/ClientFriendlyIo";
import craftingInteraction from "./interactions/craftingInteraction";
import Recipe, { RecipeGroup } from "lib/types/Recipe";
import { ContainerDefinition } from "lib/types/entities/container";
import containerInteraction from "./interactions/containerInteraction";
import { savePlayer } from "lib/utils";

export type CreatureId =
  | "test"
  | "player"
  | "trainingDummy"
  | "zombie"
  | "skeleton";

export type EntityId =
  | CreatureId
  | "container"
  | "signPost"
  | "anvil"
  | "mystic";

const entities: Record<EntityId, EntityDefinition> = {
  test: {
    name: "Test Creature",
    health: 10,
    abilityScores: {
      [AbilityScore.Strength]: 10,
      [AbilityScore.Constitution]: 10,
      [AbilityScore.Intelligence]: 10,
    },
    maxDrops: 1,
    lootTable: new WeightedTable<ItemId>([
      {
        item: "test",
        amount: [0, 1],
        weight: 1,
      },
    ]),
  } as CreatureDefinition,
  player: {
    name: "Player",
    health: 20,
    xpValue: 0,
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
    xpValue: 100,
    maxDrops: 1,
    lootTable: new WeightedTable<ItemId>([
      {
        item: "rmud3ForDummies",
        amount: [1, 1],
        weight: 1,
      },
    ]),
    tick: (creature, delta) =>
      activateAbilityOnTick(
        creature as CreatureInstance,
        delta,
        selectRandomAbility
      ),
  } satisfies CreatureDefinition as CreatureDefinition,
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
    xpValue: 15,
    maxDrops: 1,
    lootTable: new WeightedTable<ItemId>([
      {
        item: "eyeball",
        amount: [0, 2],
        weight: 1,
      },
    ]),
    tick: (creature, delta) =>
      activateAbilityOnTick(
        creature as CreatureInstance,
        delta,
        selectRandomAbility
      ),
  } satisfies CreatureDefinition as CreatureDefinition,
  skeleton: {
    name: "Skeleton",
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 4,
      [AbilityScore.Constitution]: 0,
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
    xpValue: 10,
    maxDrops: 3,
    lootTable: new WeightedTable<ItemId>([
      {
        item: "bone",
        amount: [1, 5],
        weight: 1,
      },
      {
        item: "skull",
        amount: [0, 1],
        weight: 0.2,
      },
    ]),
    tick: (creature, delta) =>
      activateAbilityOnTick(
        creature as CreatureInstance,
        delta,
        selectRandomAbility
      ),
  } satisfies CreatureDefinition as CreatureDefinition,
  container: {
    name: "Container",
    interact: containerInteraction(),
  } as ContainerDefinition,
  signPost: {
    name: "Sign Post",
    interact: (entity, player, interaction, action) => {
      if (!interaction) {
        interaction = {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "readSign",
              text: "Read Sign",
            },
          ],
        };

        return interaction;
      }

      if (action === "readSign") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "You remember you are illiterate."
        );

        return {
          ...interaction,
          state: undefined,
          actions: [
            {
              id: "readSignAgain",
              text: "Read Sign Again",
            },
            {
              id: "giveUp",
              text: "Give Up",
            },
          ],
        };
      }

      if (action === "readSignAgain") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "You still cannot read."
        );

        return {
          ...interaction,
          state: undefined,
          actions: [
            {
              id: "readSignAgain",
              text: "Read Sign Again",
            },
            {
              id: "giveUp",
              text: "Give Up",
            },
          ],
        };
      }

      return undefined;
    },
  },
  anvil: {
    name: "Anvil",
    interact: craftingInteraction(
      "Crafting at Anvil",
      new RecipeGroup([
        new Recipe(
          {
            test: 1,
            test2: 1,
          },
          "test"
        ),
        new Recipe(
          {
            bone: 1,
          },
          { definitionId: "chestplate1", amount: 1 }
        ),
        new Recipe({}, "bone"),
      ])
    ),
  },
  mystic: {
    name: "Mystic",
    interact: (entity, player, interaction, action) => {
      if (player.abilityScoreIncreases <= 0) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          'The Mystic does not look at you. "Come back when you\'re ready," they say. (You have no ability score increases left.)'
        );
        return;
      }

      if (!interaction) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          `The mystic looks at you with a knowing gaze and beckons towards the night sky. 
          You feel a strange energy in the air, as if the stars themselves are waiting for 
          you to make a choice. You have ${player.abilityScoreIncreases} ability score increases left.`
        );

        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "strength",
              text: "Increase Strength",
            },
            {
              id: "constitution",
              text: "Increase Constitution",
            },
            {
              id: "intelligence",
              text: "Increase Intelligence",
            },
            {
              id: "leave",
              text: "Goodbye",
            },
          ],
        };
      }

      if (action === "leave") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "The mystic stares into the night sky as you leave."
        );
        return undefined;
      }

      let abilityScore: AbilityScore | undefined;
      switch (action) {
        case "strength":
          abilityScore = AbilityScore.Strength;
          break;
        case "constitution":
          abilityScore = AbilityScore.Constitution;
          break;
        case "intelligence":
          abilityScore = AbilityScore.Intelligence;
          break;
        default:
          getIo().sendMsgToPlayer(
            player._id.toString(),
            "The mystic looks confused."
          );
          return interaction;
      }

      player.abilityScores[abilityScore] += 1;
      player.abilityScoreIncreases--;

      getIo().sendMsgToPlayer(
        player._id.toString(),
        `The mystic increases your ${abilityScore} by 1. You now have ${player.getAbilityScore(
          abilityScore
        )} ${abilityScore}.`
      );

      getIo().updateGameState(player._id.toString());

      savePlayer(player);
    },
  },
};

export default entities;
