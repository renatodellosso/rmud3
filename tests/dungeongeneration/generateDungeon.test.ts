import floors from "lib/dungeongeneration/Floors";
import generateDungeonLayout, {
  expand2DArray,
} from "lib/dungeongeneration/generateDungeonLayout";
import {
  Dungeon,
  DungeonLocation,
  FloorInstance,
} from "lib/dungeongeneration/types";
import {
  floorDefinitionToId,
  getCoordsFromId,
} from "lib/dungeongeneration/utils";

describe(generateDungeonLayout.name, () => {
  const TRIALS = 1000;
  const ROOM_COUNT = [5, 100];
  const REACHABLE_ROOM_PERCENTAGE = 0.5;

  function testRepeated(
    name: string,
    func: () => void,
    trials: number = TRIALS
  ) {
    test(name, () => {
      for (let i = 0; i < trials; i++) {
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
    const dungeon = breakCirclularRefs(generateDungeonLayout());

    expect(dungeon.floors.length).toBeGreaterThan(0);

    const depths = new Set(dungeon.floors.map((floor) => floor.depth));

    const maxDepth = Math.max(
      ...Object.values(floors)
        .map((floor) => floor.depths)
        .flat()
    );

    const expectedDepths: number[] = [];
    for (let i = 0; i <= maxDepth; i++) {
      expectedDepths.push(i);
    }

    expect(Array.from(depths)).toEqual(Array.from(expectedDepths));
  });

  testRepeated("should generate floors with valid definitions", () => {
    const dungeon = breakCirclularRefs(generateDungeonLayout());
    for (const floor of dungeon.floors) {
      expect(floor.definition).toBeDefined();
      expect(floors[floorDefinitionToId(floor.definition)]).toBeDefined();
    }
  });

  testRepeated("should floors with valid numbers of locations", () => {
    const dungeon = breakCirclularRefs(generateDungeonLayout());
    for (const floor of dungeon.floors) {
      const range = floor.definition.layoutGenerationOptions.roomCount;

      expect(floor.locations.length).toBeGreaterThanOrEqual(
        Math.min(range[0], ROOM_COUNT[0])
      );
      expect(floor.locations.length).toBeLessThanOrEqual(
        Math.max(range[1], ROOM_COUNT[1])
      );
    }
  });

  testRepeated("should generate floors with valid locations", () => {
    const dungeon = breakCirclularRefs(generateDungeonLayout());
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
    const dungeon = breakCirclularRefs(generateDungeonLayout());

    for (const floor of dungeon.floors) {
      for (const row of floor.locations) {
        for (const location of row) {
          if (!location) continue;

          const exits = Array.from(location.exits);
          expect(exits.length).toBeLessThanOrEqual(6); // Max 4 exits

          for (const exit of exits) {
            const exitCoords = getCoordsFromId(exit);
            const dx = Math.abs(
              exitCoords.coords[0] - location.globalCoords[0]
            );
            const dy = Math.abs(
              exitCoords.coords[1] - location.globalCoords[1]
            );
            const dz = Math.abs(exitCoords.depth - location.floor.depth);

            expect(dx + dy + dz).toBe(1); // Exits must be adjacent
          }
        }
      }
    }
  });

  testRepeated("most rooms are reachable", () => {
    const dungeon = breakCirclularRefs(generateDungeonLayout());

    const rooms: Record<string, DungeonLocation> = {};

    const allRooms = new Set<string>();

    let startRoom: DungeonLocation | undefined;

    for (const floor of dungeon.floors) {
      for (const row of floor.locations) {
        for (const location of row) {
          if (location) {
            allRooms.add(location.id);
            rooms[location.id] = location;
            startRoom ??= location; // Set the first room as the start room
          }
        }
      }
    }

    expect(startRoom).toBeDefined();

    const visited = new Set<string>();
    const stack: DungeonLocation[] = [startRoom!];

    while (stack.length > 0) {
      const current = stack.pop();

      if (!current || !current.id) continue;
      if (visited.has(current.id)) continue;

      visited.add(current.id);

      for (const exit of Array.from(current.exits)) {
        stack.push(rooms[exit]);
      }
    }

    // expect(visited.size).toBe(allRooms.size);
    expect(visited.size).toBeGreaterThanOrEqual(
      allRooms.size * REACHABLE_ROOM_PERCENTAGE
    );
  });

  testRepeated("all floors are reachable", () => {
    const dungeon = breakCirclularRefs(generateDungeonLayout());

    const floorsSet = new Set<number>();
    const visitedFloors = new Set<number>();

    let startFloor: FloorInstance | undefined;

    for (const floor of dungeon.floors) {
      floorsSet.add(floor.depth);
      startFloor ??= floor; // Set the first floor as the start floor
    }

    expect(startFloor).toBeDefined();

    const stack: FloorInstance[] = [startFloor!];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visitedFloors.has(current.depth)) continue;

      visitedFloors.add(current.depth);

      for (const row of current.locations) {
        for (const location of row) {
          if (location) {
            for (const exit of Array.from(location.exits)) {
              const exitCoords = getCoordsFromId(exit);
              const exitFloor = dungeon.floors.find(
                (f) => f.depth === exitCoords.depth
              );
              if (exitFloor && !visitedFloors.has(exitFloor.depth)) {
                stack.push(exitFloor);
              }
            }
          }
        }
      }
    }

    expect(visitedFloors.size).toBe(floorsSet.size);
    expect(visitedFloors).toEqual(floorsSet);
  });
});

describe(expand2DArray.name, () => {
  test("should expand a 2D array to a larger size", () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const expanded = expand2DArray(original, [4, 4]);

    expect(expanded.length).toBe(4);
    expect(expanded[0].length).toBe(4);
    expect(expanded[0][0]).toBe(1);
    expect(expanded[0][1]).toBe(2);
    expect(expanded[1][0]).toBe(3);
    expect(expanded[1][1]).toBe(4);
    expect(expanded[2][2]).toBeUndefined();
  });

  test("should expand a 2D array to the same size", () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const expanded = expand2DArray(original, [2, 2]);

    expect(expanded).toEqual(original);
  });

  test("should expand a 2D array to a larger size with undefined values", () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const expanded = expand2DArray(original, [3, 5]);

    expect(expanded.length).toBe(3);
    expect(expanded[0].length).toBe(5);
    expect(expanded[0][0]).toBe(1);
    expect(expanded[0][1]).toBe(2);
    expect(expanded[1][0]).toBe(3);
    expect(expanded[1][1]).toBe(4);
    expect(expanded[2][2]).toBeUndefined();
  });

  test("does not overwrite existing values", () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const expanded = expand2DArray(original, [4, 4]);

    // Ensure that the original values are preserved
    expect(expanded[0][0]).toBe(1);
    expect(expanded[0][1]).toBe(2);
    expect(expanded[1][0]).toBe(3);
    expect(expanded[1][1]).toBe(4);

    // Ensure that new values are undefined
    expect(expanded[2][2]).toBeUndefined();
    expect(expanded[3][3]).toBeUndefined();
  });
});
