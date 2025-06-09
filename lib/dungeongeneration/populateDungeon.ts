import { chance, randInRangeInt } from "lib/utils";
import { Dungeon } from "./types";
import { CreatureInstance } from "lib/types/creature";

export default function populateDungeon(dungeon: Dungeon) {
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
            const creature = new CreatureInstance(encounter.item, location.id);
            dungeon.locations[floor.depth][x][y]?.creatures.add(creature);
            
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
              const creature = new CreatureInstance(
                creatureGroup.creature,
                location.id
              );

              dungeon.locations[floor.depth][x][y]?.creatures.add(creature);
            }
          }
        }
      }
    }
  }
}
