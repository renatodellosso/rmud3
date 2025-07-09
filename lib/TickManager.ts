import { regenerateDungeon } from "./dungeongeneration/regenerateDungeon";
import { getIo } from "./ClientFriendlyIo";
import locations from "./locations";
import { EntityInstance } from "./types/entity";
import { setSingleton } from "./utils";

const TICK_INTERVAL = 1000; // 1 second
const REGENERATE_DUNGEON_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function startTicking() {
  if (!locations) {
    throw new Error("Locations singleton not found");
  }

  let lastTick = new Date().getTime();
  let tickCount = 0;

  setInterval(() => {
    const shouldLog = tickCount % 60 === 0;

    if (shouldLog) console.time("Tick");

    const now = new Date().getTime();
    const delta = (now - lastTick) / 1000;

    lastTick = now;

    const locationsWithPlayers = getLocationsByIfTheyHavePlayers();

    const toTick: EntityInstance[] = [];

    for (const location of Object.values(locations)) {
      // If there are no players in this location or adjacent locations, don't tick entities here
      if (
        !locationsWithPlayers[location.id] &&
        !Array.from(location.exits).some((e) => locationsWithPlayers[e])
      ) {
        continue;
      }

      for (const creature of Array.from(location.entities)) {
        toTick.push(creature);
      }
    }

    for (const creature of toTick) {
      try {
        creature.tick(delta);
      } catch (error) {
        console.error(
          `Error ticking creature ${creature._id} (${creature.definitionId}) in location ${creature.location}:`,
          error
        );
      }
    }

    if (shouldLog) {
      console.log(`Ticked ${toTick.length} creatures`);
      console.timeEnd("Tick");
    }

    tickCount++;
  }, TICK_INTERVAL);

  let dungeonRegenerationCounter = 0;
  setInterval(() => {
    dungeonRegenerationCounter += TICK_INTERVAL;

    setSingleton(
      "minutesTillDungeonRegeneration",
      Math.floor(
        (REGENERATE_DUNGEON_INTERVAL - dungeonRegenerationCounter) / 1000 / 60
      )
    );

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

function getLocationsByIfTheyHavePlayers() {
  const locationsByPlayer: { [locationId: string]: boolean } = {};

  for (const location of Object.values(locations)) {
    locationsByPlayer[location.id] = Array.from(location.entities).some(
      (e) => e.definitionId === "player"
    );
  }

  return locationsByPlayer;
}
