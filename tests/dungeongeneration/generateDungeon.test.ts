import floors from "lib/dungeongeneration/Floors";
import generateDungeon from "lib/dungeongeneration/generateDungeon";
import { Dungeon, FloorInstance } from "lib/dungeongeneration/types";
import {
  floorDefinitionToId,
  getCoordsFromId,
} from "lib/dungeongeneration/utils";

describe(generateDungeon.name, () => {
  const TRIALS = 1000;
  const ROOM_COUNT = [5, 100];

  function testRepeated(name: string, func: () => void) {
    test(name, () => {
      for (let i = 0; i < TRIALS; i++) {
        func();
      }
    });
  }

  function breakCirclularRefs(dungeon: Dungeon) {
    for (const floor of dungeon.floors) {
      for (const row of floor.locations) {
        for (const location of row) {
          if (location) {
            const { locations, ...newFloor } = floor; // Break circular reference
            location.floor = newFloor as FloorInstance;
          }
        }
      }
    }
    return dungeon;
  }

  testRepeated("should generate a dungeon with a floor for every depth", () => {
    const dungeon = breakCirclularRefs(generateDungeon());

    expect(dungeon.floors.length).toBeGreaterThan(0);

    const depths = new Set(
      dungeon.floors.map((floor) => floor.definition.depths)
    );
    const expectedDepths = new Set(
      Object.values(floors).map((floor) => floor.depths)
    );

    expect(Array.from(depths)).toEqual(Array.from(expectedDepths));
  });

  testRepeated("should generate floors with valid definitions", () => {
    const dungeon = breakCirclularRefs(generateDungeon());
    for (const floor of dungeon.floors) {
      expect(floor.definition).toBeDefined();
      expect(floors[floorDefinitionToId(floor.definition)]).toBeDefined();
    }
  });

  testRepeated("should floors with valid numbers of locations", () => {
    const dungeon = breakCirclularRefs(generateDungeon());
    for (const floor of dungeon.floors) {
      const range = floor.definition.generationOptions.roomCount;

      expect(floor.locations.length).toBeGreaterThanOrEqual(
        Math.min(range[0], ROOM_COUNT[0])
      );
      expect(floor.locations.length).toBeLessThanOrEqual(
        Math.max(range[1], ROOM_COUNT[1])
      );
    }
  });

  testRepeated("should generate floors with valid locations", () => {
    const dungeon = breakCirclularRefs(generateDungeon());
    for (const floor of dungeon.floors) {
      expect(floor.locations.length).toBeGreaterThan(0);
      for (const row of floor.locations) {
        for (const location of row) {
          if (location) {
            expect(location.id).toBeDefined();

            // Ignore circular reference
            floor.locations = undefined as any;
            location.floor.locations = undefined as any;
            expect(location.globalCoords).toBeDefined();
            expect(location.floorCoords).toBeDefined();
          }
        }
      }
    }
  });

  testRepeated("should generate rooms with only adjacent exits", () => {
    const dungeon = breakCirclularRefs(generateDungeon());
    for (const floor of dungeon.floors) {
      for (const row of floor.locations) {
        for (const location of row) {
          if (!location) continue;

          const exits = Array.from(location.exits);
          expect(exits.length).toBeLessThanOrEqual(6); // Max 4 exits

          for (const exit of exits) {
            const exitCoords = getCoordsFromId(exit);
            const dx = Math.abs(exitCoords.coords[0] - location.floorCoords[0]);
            const dy = Math.abs(exitCoords.coords[1] - location.floorCoords[1]);
            const dz = Math.abs(
              exitCoords.depth - location.floor.definition.depths
            );

            expect(dx + dy + dz).toBe(1); // Exits must be adjacent
          }
        }
      }
    }
  });
});
