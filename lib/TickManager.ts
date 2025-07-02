import { CreatureInstance } from "./types/entities/creature";
import { getSingleton } from "./utils";
import { regenerateDungeon } from "./dungeongeneration/regenerateDungeon";
import { getIo } from "./ClientFriendlyIo";

const TICK_INTERVAL = 1000; // 1 second
const REGENERATE_DUNGEON_INTERVAL = 30 * 60 * 1000; // 30 minutes

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
  }, TICK_INTERVAL);

  let dungeonRegenerationCounter = 0;
  setInterval(() => {
    dungeonRegenerationCounter += TICK_INTERVAL;

    if (
      dungeonRegenerationCounter ===
      REGENERATE_DUNGEON_INTERVAL - 5 * 60 * 1000
    ) {
      getIo().sendMsgToAll(
        "NOTICE: The dungeon will be regenerated in 5 minutes."
      );
      return;
    }

    if (
      dungeonRegenerationCounter ===
      REGENERATE_DUNGEON_INTERVAL - 60 * 1000
    ) {
      getIo().sendMsgToAll(
        "NOTICE: The dungeon will be regenerated in 1 minute."
      );
      return;
    }

    if (dungeonRegenerationCounter < REGENERATE_DUNGEON_INTERVAL) {
      return;
    }

    const io = getIo();
    io.sendMsgToAll("Dungeon regeneration in progress...");

    regenerateDungeon();

    io.sendMsgToAll("Dungeon regeneration complete.");
    dungeonRegenerationCounter = 0;
  }, TICK_INTERVAL);
}
