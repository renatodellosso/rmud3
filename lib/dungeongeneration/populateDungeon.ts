import { chance, randInRangeInt } from "lib/utils";
import { Location } from "lib/types/Location";
import { Dungeon, DungeonLocation, FloorInstance } from "./types";
import { CreatureInstance } from "lib/types/entities/creature";
import entities, { CreatureId, EntityId } from "lib/gamedata/entities";
import { EntityInstance } from "lib/types/entity";

export default function populateDungeon(dungeon: Dungeon) {
  let creatureCount = 0;

  for (const floor of dungeon.floors) {
    for (let x = 0; x < floor.size[0]; x++) {
      for (let y = 0; y < floor.size[1]; y++) {
        const location = floor.locations[x][y];
        if (!location) continue;

        const roomCreatureCount = populateRoom(floor, location);
        creatureCount += roomCreatureCount;
      }
    }
  }

  console.log(`Populated dungeon with ${creatureCount} creatures.`);
}

/**
 * @returns how many creatures were added to the room
 */
export function populateRoom(floor: FloorInstance, location: DungeonLocation) {
  let creatureCount = 0;
  for (let i = 0; i < floor.definition.populationOptions.maxEncounters; i++) {
    if (!chance(floor.definition.populationOptions.encounterChance)) continue;

    const encounter = floor.definition.populationOptions.encounters.roll();

    for (let i = 0; i < encounter.amount; i++) {
      if (typeof encounter.item === "string") {
        addEntityToLocation(location, encounter.item as EntityId);

        creatureCount++;
        continue;
      }

      if (typeof encounter.item === "function") {
        const entity = encounter.item(location);

        location.entities.add(entity);
        creatureCount++;
        continue;
      }

      for (const entityGroup of encounter.item) {
        const amount =
          typeof entityGroup.amount === "number"
            ? entityGroup.amount
            : randInRangeInt(entityGroup.amount[0], entityGroup.amount[1]);

        for (let j = 0; j < amount; j++) {
          if (typeof entityGroup.entity === "string") {
            addEntityToLocation(location, entityGroup.entity);
          } else if (typeof entityGroup.entity === "function") {
            const entity = entityGroup.entity(location);
            location.entities.add(entity);
          }

          creatureCount++;
        }
      }
    }
  }

  return creatureCount;
}

function addEntityToLocation(location: Location, defId: EntityId) {
  const entity =
    "health" in entities[defId]
      ? new CreatureInstance(defId as CreatureId, location.id)
      : new EntityInstance(defId, location.id);
  location.entities.add(entity);
  return entity;
}
