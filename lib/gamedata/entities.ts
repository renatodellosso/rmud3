import { AbilityScore, DamageType, WeightedTable } from "lib/types/types";
import {
  CreatureDefinition,
  CreatureInstance,
} from "../types/entities/creature";
import * as Abilities from "lib/gamedata/Abilities";
import * as CanTarget from "lib/gamedata/CanTarget";
import {
  activateAbilityAndMoveRandomlyOnTick,
  activateAbilityOnTick,
  selectRandomAbility,
} from "lib/entityutils";
import { EntityDefinition } from "lib/types/entity";
import items, { ItemId } from "./items";
import { getIo } from "lib/ClientFriendlyIo";
import craftingInteraction from "./interactions/craftingInteraction";
import Recipe, { RecipeGroup } from "lib/types/Recipe";
import { ContainerInstance } from "lib/types/entities/container";
import inventoryInteraction from "./interactions/inventoryInteraction";
import { savePlayer } from "lib/utils";
import { getFromOptionalFunc } from "../utils";
import { vaultLevelling } from "lib/types/Vault";

export type CreatureId =
  | "test"
  | "player"
  | "trainingDummy"
  | "zombie"
  | "skeleton"
  | "slime"
  | "troll";

export type EntityId =
  | CreatureId
  | "container"
  | "signPost"
  | "anvil"
  | "mystic"
  | "tavernKeeper"
  | "junkCollector"
  | "banker"
  | "vault";

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
          getIo().sendMsgToRoom(
            creature.location,
            `${creature.name} taunts everyone in the room!`
          );
          return true;
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
    health: 15,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 1,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack("Bite", "Bite an enemy.", 3, 1, DamageType.Piercing, [
        CanTarget.isPlayer,
      ]),
    ],
    xpValue: 15,
    maxDrops: 2,
    lootTable: new WeightedTable<ItemId>([
      {
        item: "rottenFlesh",
        amount: [1, 2],
        weight: 1.2
      },
      {
        item: "eyeball",
        amount: [0, 2],
        weight: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
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
        amount: [1, 2],
        weight: 1,
      },
      {
        item: "skull",
        amount: [0, 1],
        weight: 0.2,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  } satisfies CreatureDefinition as CreatureDefinition,
  slime: {
    name: "Slime",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 0,
      [AbilityScore.Constitution]: 0,
      [AbilityScore.Intelligence]: 0,
    },
    intrinsicAbilities: [
      Abilities.attack("Slime", "Slime.", 4, 1, DamageType.Bludgeoning, [
        CanTarget.isPlayer,
      ]),
    ],
    xpValue: 5,
    maxDrops: 1,
    lootTable: new WeightedTable<ItemId>([
      {
        item: "slime",
        amount: [1, 3],
        weight: 1,
      },
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.1),
  } satisfies CreatureDefinition as CreatureDefinition,
  troll: {
    name: "Troll",
    health: 25,
    abilityScores: {
      [AbilityScore.Strength]: 5,
      [AbilityScore.Constitution]: 5,
      [AbilityScore.Intelligence]: 1,
    },
    intrinsicAbilities: [
      Abilities.attack(
        "Slam",
        "Slam.",
        6,
        5,
        DamageType.Bludgeoning,
        [CanTarget.isPlayer]
      ),
      Abilities.heal(
        "Heal",
        "Recover a small amount of health.",
        10,
        5,
        [CanTarget.isSelf]
      )
    ],
    xpValue: 20,
    maxDrops: 2,
    lootTable: new WeightedTable<ItemId>([
      {
        item: "taintedFlesh",
        amount: [1, 2],
        weight: 1,
      },
      {
        item: "trollTooth",
        amount: [1, 3],
        weight: 0.8
      }
    ]),
    tick: activateAbilityAndMoveRandomlyOnTick(0.5, selectRandomAbility, 0.03),
  } satisfies CreatureDefinition as CreatureDefinition,
  container: {
    name: "Container",
    interact: (entity, player, interaction, action) =>
      inventoryInteraction(
        entity as ContainerInstance,
        player,
        interaction,
        action,
        (entity as ContainerInstance).inventory,
        entity.name
      ),
  },
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
        new Recipe(
          {},
          {
            definitionId: "chestplate2",
            amount: 1,
          }
        ),
        new Recipe({}, "bone"),
        new Recipe({}, "healthPotion"),
      ])
    ),
  },
  mystic: {
    name: "Mystic",
    interact: (entity, player, interaction, action) => {
      if (
        player.abilityScoreIncreases <= 0 &&
        (!interaction || (action !== "reset" && action !== "leave"))
      ) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          'The Mystic does not look at you. "Come back when you\'re ready," they say. (You have no ability score increases left.)'
        );
        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "leave",
              text: "Goodbye",
            },
            {
              id: "reset",
              text: "Reset Ability Scores",
            },
          ],
        };
      }

      const increaseActions = [
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
          id: "reset",
          text: "Reset Ability Scores",
        },
        {
          id: "leave",
          text: "Goodbye",
        },
      ];

      if (!interaction) {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          `The mystic looks at you with a knowing gaze and beckons towards the night sky. 
          You feel a strange energy in the air, as if the stars themselves are waiting for 
          you to make a choice. You have ${player.abilityScoreIncreases} ability score increases left. 
          Constitution grants +5 health, strength grants +10 kg carrying capacity, and intelligence improves
          abilities.`
        );

        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: increaseActions,
        };
      }

      if (action === "leave") {
        getIo().sendMsgToPlayer(
          player._id.toString(),
          "The mystic stares into the night sky as you leave."
        );
        return undefined;
      }

      if (action === "reset") {
        for (const score of Object.values(AbilityScore)) {
          player.abilityScoreIncreases += player.abilityScores[score];
          player.abilityScores[score] = 0;
        }

        getIo().sendMsgToPlayer(
          player._id.toString(),
          `The mystic waves their hand and resets your ability scores. 
          You have ${player.abilityScoreIncreases} ability score increases left.`
        );

        return {
          ...interaction,
          actions: increaseActions,
        };
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
        )} ${abilityScore} and ${
          player.abilityScoreIncreases
        } ability score increases left.`
      );

      getIo().updateGameState(player._id.toString());

      savePlayer(player);

      return {
        ...interaction,
        actions:
          player.abilityScoreIncreases > 0
            ? increaseActions
            : [
                {
                  id: "leave",
                  text: "Goodbye",
                },
                {
                  id: "reset",
                  text: "Reset Ability Scores",
                },
              ],
      };
    },
  },
  tavernKeeper: {
    name: "Tavern Keeper",
    interact: (entity, player, interaction, action) => {
      if (!interaction) {
        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions: [
            {
              id: "rent",
              text: "Rent Room (5 gold, restores health)",
            },
            {
              id: "leave",
              text: "Leave Tavern",
            },
          ],
        };
      }

      if (action === "rent") {
        if (player.inventory.getCountById("money") < 5) {
          getIo().sendMsgToPlayer(
            player._id.toString(),
            "You don't have enough money to rent a room."
          );
          return interaction;
        }

        player.inventory.removeById("money", 5);
        player.health = player.getMaxHealth();

        savePlayer(player);

        const io = getIo();
        io.sendMsgToPlayer(
          player._id.toString(),
          "\"Here's the key. Room's upstairs,\" the tavern keeper says."
        );
        io.sendMsgToPlayer(
          player._id.toString(),
          "You rest for several hours. Your health is fully restored."
        );
        io.updateGameState(player._id.toString());

        return undefined;
      }

      if (action === "leave") {
        getIo().sendMsgToPlayer(player._id.toString(), "You walk away.");
        return undefined;
      }

      return interaction;
    },
  },
  junkCollector: {
    name: "Junk Collector",
    interact: (entity, player, interaction, action) => {
      const recipes = new RecipeGroup(
        player.inventory.items
          .filter((i) => i.definitionId !== "money")
          .map(
            (item) =>
              new Recipe(
                { [item.definitionId]: 1 },
                {
                  definitionId: "money",
                  amount: getFromOptionalFunc(
                    items[item.definitionId].getSellValue,
                    item
                  ),
                }
              )
          )
      );

      const func = craftingInteraction("Sell Items", recipes);

      return func(entity, player, interaction, action);
    },
  },
  banker: {
    name: "Banker",
    canInteract: (entity, player) =>
      player.vault.level < vaultLevelling.length - 1,
    interact: (entity, player, interaction, action) => {
      const nextVaultLevel = player.vault.level + 1;
      const nextVaultLevelStats = vaultLevelling[nextVaultLevel];
      const playerMoney = player.inventory.getCountById("money");

      const io = getIo();

      if (!interaction) {
        io.sendMsgToPlayer(
          player._id.toString(),
          `"Welcome to the bank! Your vault is currently at level ${
            player.vault.level + 1
          } and has a capacity of ${
            vaultLevelling[player.vault.level].maxWeight
          } kg.
          You can upgrade it to level ${nextVaultLevel + 1} for ${
            nextVaultLevelStats.price
          } ${items["money"].name},
          which will increase your vault's maximum weight to ${
            nextVaultLevelStats.maxWeight
          } kg.`
        );

        if (playerMoney < nextVaultLevelStats.price) {
          io.sendMsgToPlayer(
            player._id.toString(),
            `You only have ${playerMoney} ${
              items["money"].name
            }, which is not enough to upgrade your vault. 
            You need ${nextVaultLevelStats.price - playerMoney} more ${
              items["money"].name
            }.`
          );
        }

        const actions = [
          {
            id: "leave",
            text: "Goodbye",
          },
        ];

        if (playerMoney >= nextVaultLevelStats.price) {
          actions.unshift({
            id: "upgrade",
            text: "Upgrade Vault",
          });
        }

        return {
          entityId: entity._id,
          type: "logOnly",
          state: undefined,
          actions,
        };
      }

      if (action === "leave") {
        io.sendMsgToPlayer(player._id.toString(), "You walk away.");
        return undefined;
      }

      if (action === "upgrade") {
        if (playerMoney < nextVaultLevelStats.price) {
          io.sendMsgToPlayer(
            player._id.toString(),
            `You only have ${playerMoney} ${
              items["money"].name
            }, which is not enough to upgrade your vault. 
            You need ${nextVaultLevelStats.price - playerMoney} more ${
              items["money"].name
            }.`
          );
          return interaction;
        }

        player.inventory.removeById("money", nextVaultLevelStats.price);
        player.vault.level = nextVaultLevel;
        player.vault.recalculateVaultSize();

        savePlayer(player);

        io.sendMsgToPlayer(
          player._id.toString(),
          `Your vault has been upgraded to level ${nextVaultLevel + 1}. 
          Your vault's maximum weight is now ${
            nextVaultLevelStats.maxWeight
          } kg.`
        );

        io.updateGameState(player._id.toString());

        return undefined;
      }

      return interaction;
    },
  },
  vault: {
    name: "Vault",
    interact: (entity, player, interaction, action) =>
      inventoryInteraction(
        entity,
        player,
        interaction,
        action,
        player.vault.inventory,
        "Vault"
      ),
  },
};

export default entities;
