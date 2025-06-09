import generateDungeonLayout from "./generateDungeonLayout";
import populateDungeon from "./populateDungeon";
import { Dungeon } from "./types";

export default function generateDungeon(): Dungeon {
  console.time("Dungeon generation time");
  console.log("Generating dungeon...");

  console.time("Dungeon layout generation time");
  const dungeon = generateDungeonLayout();
  console.timeEnd("Dungeon layout generation time");

  console.log("Dungeon layout generated, populating dungeon...");
  console.time("Dungeon population time");
  populateDungeon(dungeon);
  console.timeEnd("Dungeon population time");

  console.timeEnd("Dungeon generation time");
  return dungeon;
}
