import Rand from "rand-seed";
import { Range } from "./types/types";
import Quest, { QuestType } from "./types/Quest";
import { CreatureId, creatures } from "./gamedata/entities";
import items, { ItemId } from "./gamedata/items";
import { ItemGroup } from "./types/Recipe";
import shopInteraction, {
  getShopItemsForLevel,
  itemIdToShopLevel,
  shopItemsByMinLevel,
} from "./gamedata/interactions/shopInteraction";
import { getXpForNextLevel } from "./gamedata/levelling";
import { setSingleton } from "./utils";

const QUEST_AMOUNT: Range = [3, 5];

export function generateDailyQuests() {
  console.log("Generating daily quests...");
  const quests = getDailyQuests();
  setSingleton("dailyQuests", quests);
}

export function getDailyQuests() {
  // Use seeding to ensure consistent quests across server restarts
  const rng = new Rand(new Date().toDateString());

  const questCount = randRangeInt(QUEST_AMOUNT, rng);

  const quests: Quest[] = [];
  for (let i = 0; i < questCount; i++) {
    quests.push(randomQuest(i, rng));
  }

  return quests;
}

function randRangeFloat(range: Range, rng: Rand): number {
  return rng.next() * (range[1] - range[0]) + range[0];
}

function randRangeInt(range: Range, rng: Rand): number {
  return Math.round(randRangeFloat(range, rng));
}

export function randomQuest(index: number, rng: Rand): Quest {
  const questTypes = Object.values(QuestType);
  const type = questTypes[randRangeInt([0, questTypes.length - 1], rng)];

  const id = `${new Date().toISOString()}-${index}`;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const expiresAt = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    0,
    0,
    0
  );

  const base: Partial<Quest> = {
    id,
    type,
    expiresAt,
  };

  base.objective = objectiveGenerator[type](base, rng);

  const level = Math.max(
    0,
    objectiveToLevel[type](base.objective as Quest["objective"]) +
      randRangeInt([-5, 5], rng)
  );
  const rewards = generateRewards(level, type, rng);

  base.level = level;
  base.rewards = rewards;

  return base as Quest;
}

function generateRewards(
  level: number,
  questType: QuestType,
  rng: Rand
): Quest["rewards"] {
  const xp = Math.round(
    (level > 1
      ? getXpForNextLevel(level) - getXpForNextLevel(level - 1)
      : getXpForNextLevel(1)) * randRangeFloat([0.2, 1.2], rng)
  );
  const items: ItemGroup = {
    money: Math.round(randRangeFloat([1, 5], rng) * Math.pow(level, 1.5)),
  };

  const levelsOfItems = level * randRangeInt([5, 20], rng);
  let levelUsed = 0;
  while (levelUsed < levelsOfItems) {
    const availableItems = getShopItemsForLevel(level);

    if (availableItems.length === 0) break; // No items available for this level

    const itemId =
      availableItems[randRangeInt([0, availableItems.length - 1], rng)];

    // Find the level of the item
    levelUsed += itemIdToShopLevel(itemId);

    items[itemId] = (items[itemId] || 0) + 1;
  }

  return {
    xp,
    items,
  };
}

const objectiveGenerator: Record<
  QuestType,
  (base: Partial<Quest>, rng: Rand) => Quest["objective"]
> = {
  [QuestType.Kill]: (base, rng) => {
    const creatureArray = Object.entries(creatures).filter(
      ([id]) => !id.startsWith("friendly")
    );

    const randomCreature =
      creatureArray[randRangeInt([0, creatureArray.length - 1], rng)];
    const creatureId = randomCreature[0] as CreatureId;

    return creatureId;
  },
  // [QuestType.Fetch]: (base, rng) => {
  //   const itemArray = Object.entries(items);

  //   const randomItem = itemArray[randRange([0, itemArray.length - 1], rng)];

  //   const group: ItemGroup = {};
  //   group[randomItem[0] as ItemId] = randRange([1, 5], rng); // Random quantity between 1 and 5

  //   return group;
  // },
};

const objectiveToLevel: Record<
  QuestType,
  (objective: Quest["objective"]) => number
> = {
  [QuestType.Kill]: (objective) => {
    const creatureId = objective as CreatureId;
    const def = creatures[creatureId];

    for (let level = 1; level <= 1000; level++) {
      const nextLevelXp = getXpForNextLevel(level);
      if (def.xpValue < nextLevelXp * 0.01) {
        return level;
      }
    }

    return 0;
  },
};
