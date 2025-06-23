import { Dungeon } from "./dungeongeneration/types";
import entities from "./gamedata/entities";
import { CreatureInstance } from "./types/entities/creature";
import { getSingleton } from "./utils";
import regenerateDungeon from "./dungeongeneration/regenerateDungeon";

const TICK_INTERVAL = 1000; // 1 second

export function startTicking() {
  const locations = getSingleton("locations");

  if (!locations) {
    throw new Error("Locations singleton not found");
  }

  let lastTick = new Date().getTime();

  setInterval(() => {
    const now = new Date().getTime();
    const delta = (now - lastTick) / 1000;

    lastTick = now;

    // Expand to include world objects later
    const toTick: CreatureInstance[] = [];

    for (const location of Object.values(locations)) {
      for (const creature of location.entities) {
        toTick.push(creature);
      }
    }

    for (const creature of toTick) {
      creature.tick(delta);
    }

    regenerateDungeon(getSingleton<Dungeon>("dungeon")!, delta);
  }, TICK_INTERVAL);
}
