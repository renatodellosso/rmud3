import { CreatureId, creatures } from "lib/gamedata/entities";
import { ItemGroup } from "./Recipe";
import items, { ItemId } from "lib/gamedata/items";
import { getFromOptionalFunc, getSingleton } from "../utils";
import { ItemInstance } from "./item";
import PlayerEventListener from "./PlayerEventListener";
import { PlayerInstance } from "./entities/player";
import { getIo } from "lib/ClientFriendlyIo";

export enum QuestType {
  Kill = "Kill",
  // Fetch = "Fetch",
}

type Quest = {
  id: string;
  type: QuestType;
  level: number;
  expiresAt: Date;
  rewards: {
    xp: number;
    items: ItemGroup;
  };
  objective: CreatureId | ItemGroup; // The objective can be a creature ID for Kill quests or an item group for Fetch quests
};

export default Quest;

export function questToString(quest: Quest): string {
  let msg = `Level ${quest.level} ${quest.type} Quest - expires in ${new Date(
    quest.expiresAt.getTime() - Date.now()
  )
    .toISOString()
    .substring(11, 19)}\n`;

  switch (quest.type) {
    case QuestType.Kill:
      msg += `Objective: Slay a ${
        creatures[quest.objective as CreatureId].name
      }\n`;
      break;
  }

  msg += `Rewards: ${quest.rewards.xp.toLocaleString()} XP, ${Object.entries(
    quest.rewards.items
  )
    .map(
      ([itemId, amount]) =>
        `${amount.toLocaleString()}x ${getFromOptionalFunc(
          items[itemId as ItemId].getName,
          new ItemInstance(itemId as ItemId, amount)
        )}`
    )
    .join(", ")}\n`;

  return msg;
}

export const questListener: PlayerEventListener = {
  onKill: (player, creature) => {
    const quests = getSingleton<Quest[]>("dailyQuests");

    if (!quests) {
      console.warn("No daily quests found");
      return;
    }

    const availableQuests = quests.filter(
      (q) => !player.completedQuests.includes(q.id)
    );

    const relevantQuests = availableQuests.filter(
      (q) => q.type === QuestType.Kill && q.objective === creature.definitionId
    );

    for (const quest of relevantQuests) {
      completeQuest(player, quest);
    }
  },
};

function completeQuest(player: PlayerInstance, quest: Quest) {
  console.log(
    `Player ${player.name} completed quest ${quest.id} (${quest.type})`
  );

  player.completedQuests.push(quest.id);

  player.addXp(quest.rewards.xp);

  for (const [itemId, amount] of Object.entries(quest.rewards.items)) {
    player
      .getCraftingInventory()
      .add(new ItemInstance(itemId as ItemId, amount), true);
  }

  getIo().sendMsgToPlayer(
    player._id.toString(),
    `>>> Quest completed! You've earned ${quest.rewards.xp.toLocaleString()} XP and received: ${Object.entries(
      quest.rewards.items
    )
      .map(
        ([itemId, amount]) =>
          `${amount.toLocaleString()}x ${getFromOptionalFunc(
            items[itemId as ItemId].getName,
            new ItemInstance(itemId as ItemId, amount)
          )}`
      )
      .join(", ")}`
  );
}
