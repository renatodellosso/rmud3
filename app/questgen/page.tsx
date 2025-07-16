"use client";

import { getDailyQuests, randomQuest } from "lib/questutils";
import Quest, { questToString } from "lib/types/Quest";
import Rand from "rand-seed";
import { useEffect, useState } from "react";

export default function QuestGen() {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const dailyQuests = getDailyQuests();
    setQuests(dailyQuests);
  }, []);

  function generateNewQuests() {
    const newQuests: Quest[] = [];
    const rand = new Rand(new Date().toISOString());
    for (let i = 0; i < 5; i++) {
      newQuests.push(randomQuest(i, rand));
    }
    setQuests(newQuests);
  }

  return (
    <div>
      <button onClick={() => setQuests(getDailyQuests())}>
        Refresh Quests
      </button>
      <button onClick={generateNewQuests}>Generate New Quest</button>
      <h1>Daily Quests</h1>
      {quests.length === 0 ? (
        <p>No quests available</p>
      ) : (
        <ul>
          {quests.map((quest) => (
            <li key={quest.id}>
              {questToString(quest)
                .split("\n")
                .map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
