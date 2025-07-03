import locations from "lib/locations";
import { Dungeon, DungeonLocation, FloorInstance } from "./types";
import generateDungeon from "./generateDungeon";
import { LocationId } from "lib/gamedata/rawLocations";
import { isInTown, setSingleton } from "lib/utils";
import { setupDungeonLocations } from "lib/startup";
import getPlayerManager from "lib/PlayerManager";
import { getRawIoSingleton } from "lib/types/socketioserverutils";
import LocationMap from "lib/types/LocationMap";

export function regenerateDungeon() {
  console.log("Regenerating dungeon...");

  removeOldDungeon();

  const dungeon = generateDungeon();
  setSingleton<Dungeon>("dungeon", dungeon);
  setupDungeonLocations();

  resetPlayerMaps();

  console.log("Dungeon regenerated!");
}

function resetPlayerMaps() {
  const io = getRawIoSingleton();
  if (!io) {
    console.error("No IO instance found, cannot reset player maps.");
    return;
  }

  for (const socket of Array.from(io.sockets.sockets.values())) {
    if (!socket.data.session) {
      continue;
    }
    socket.data.session.map = new LocationMap();
  }
}

function removeOldDungeon() {
  for (const location of Object.values(locations)) {
    if (isInTown(location.id)) {
      continue;
    }

    for (const entity of Array.from(location.entities)) {
      if (entity.definitionId === "player") {
        locations["dungeon-entrance"].enter(entity);
      }
    }

    delete locations[location.id];
  }

  locations["dungeon-entrance"].exits = new Set<LocationId>(
    Array.from(locations["dungeon-entrance"].exits).filter(
      (exit) => isInTown(exit)
    )
  );
}
