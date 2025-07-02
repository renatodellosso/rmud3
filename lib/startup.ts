import generateDungeon from "./dungeongeneration/generateDungeon";
import { DungeonLocation } from "./dungeongeneration/types";
import { addRawLocations } from "./gamedata/rawLocations";
import locations from "./locations";
import { getSingleton } from "./utils";

export function setupLocations() {
  addRawLocations(locations);
  setupDungeonLocations();
}

export function setupDungeonLocations() {
  const dungeon = getSingleton("dungeon", () => {
    const dungeon = generateDungeon();
    console.log("Generated dungeon!");
    return dungeon;
  })!;

  let dungeonStart: DungeonLocation | undefined = undefined;
  for (let x = 0; x < dungeon.locations[0].length; x++) {
    for (let y = 0; y < dungeon.locations[0][x].length; y++) {
      if (dungeon.locations[0][x][y]) dungeonStart = dungeon.locations[0][x][y];
    }
  }

  locations["dungeon-entrance"].exits.add(dungeonStart!.id);
  dungeonStart!.exits.add("dungeon-entrance");
}
