import { chance, randInRangeInt } from "lib/utils";
import { Location } from "lib/types/Location";
import { Dungeon } from "./types";
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

        if (!chance(floor.definition.populationOptions.encounterChance))
          continue;

        const encounter = floor.definition.populationOptions.encounters.roll();

        for (let i = 0; i < encounter.amount; i++) {
          if (typeof encounter.item === "string") {
            addEntityToLocation(location, encounter.item as EntityId);

            creatureCount++;
            continue;
          }

          for (const creatureGroup of encounter.item) {
            const amount =
              typeof creatureGroup.amount === "number"
                ? creatureGroup.amount
                : randInRangeInt(
                    creatureGroup.amount[0],
                    creatureGroup.amount[1]
                  );

            for (let j = 0; j < amount; j++) {
              addEntityToLocation(location, creatureGroup.creature);

              creatureCount++;
            }
          }
        }
      }
    }
  }

  console.log(`Populated dungeon with ${creatureCount} creatures.`);
}

function addEntityToLocation(location: Location, defId: EntityId) {
  const entity =
    "health" in entities[defId]
      ? new CreatureInstance(defId as CreatureId, location.id)
      : new EntityInstance(defId, location.id);
  location.entities.add(entity);
  return entity;
}
