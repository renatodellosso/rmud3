import { LocationId } from "lib/gamedata/rawLocations";
import locations from "lib/locations";
import { Dungeon, DungeonLocation } from "lib/dungeongeneration/types";
import { getSingleton } from "lib/utils";

export default class LocationMap {
  locations: (LocationId | undefined)[][][];
  exits: Partial<{ [from in LocationId]: [number, number, number][] }>;
  visited: Partial<{
    [from in LocationId]: boolean;
  }>;

  constructor() {
    this.locations = [
      [
        ["workshop", "north-road-2", undefined  ],
        ["bank", "north-road-1", "training-ground"],
        ["docks", "town-square", "dungeon-entrance"],
        [undefined, "tavern", undefined],
      ],
    ];

    this.exits = {};
    this.visited = {};

    // Add exits for the initial locations
    for (let x = 0; x < this.locations[0].length; x++) {
      for (let y = 0; y < this.locations[0][x].length; y++) {
        const locId = this.locations[0][x][y];
        if (locId) {
          this.visited[locId] = true;

          this.exits[locId] = [];

          const location = locations[locId];
          if (!location) continue;

          for (const exit of Array.from(location.exits)) {
            const pos = this.getPosition(exit);
            if (pos) this.exits[locId]!.push(pos);
          }
        }
      }
    }
  }

  addLocation(id: LocationId, addExitsToLocations = true) {
    const location = locations[id] as DungeonLocation;
    if (!("floor" in location) || !("globalCoords" in location)) {
      return;
    }

    const dungeon = getSingleton<Dungeon>("dungeon");
    if (!dungeon)
      throw new Error("Tried to add a location to a map without a dungeon");

    if (this.locations.length <= location.floor.depth + 1) {
      const floorLocations = dungeon!.locations[location.floor.depth];
      this.locations.push(
        new Array(floorLocations.length)
          .fill(undefined)
          .map(() => new Array(floorLocations[0].length).fill(undefined))
      );
    }

    this.locations[location.floor.depth + 1][location.globalCoords[0]][
      location.globalCoords[1]
    ] = id;

    this.exits[id] = [];

    if (!addExitsToLocations) return;

    for (const exit of Array.from(location.exits)) {
      const exitLoc = locations[exit] as DungeonLocation;

      if (!("globalCoords" in exitLoc)) {
        continue;
      }

      console.log(
        `Adding exit from ${id} to ${exit} at depth ${exitLoc.floor.depth}, coords ${exitLoc.globalCoords}`
      );

      const exitPos: [number, number, number] = [
        exitLoc.floor.depth + 1,
        exitLoc.globalCoords[0],
        exitLoc.globalCoords[1],
      ];

      if (this.exits[id]!.includes(exitPos)) continue;

      this.exits[id]!.push(exitPos);

      if (this.exits[exit]) this.exits[exit]!.push(exitPos);
      else this.addLocation(exit, false);
    }
  }

  getDepth(locationId: LocationId): number {
    for (let depth = 0; depth < this.locations.length; depth++) {
      for (let x = 0; x < this.locations[depth].length; x++) {
        for (let y = 0; y < this.locations[depth][x].length; y++) {
          if (this.locations[depth][x][y] === locationId) {
            return depth;
          }
        }
      }
    }
    return 0; // Not found
  }

  getPosition(locationId: LocationId): [number, number, number] | undefined {
    const location = locations[locationId] as DungeonLocation;
    if (location && "globalCoords" in location) {
      return [
        location.floor.depth + 1,
        location.globalCoords[0],
        location.globalCoords[1],
      ];
    }

    for (let depth = 0; depth < this.locations.length; depth++) {
      for (let x = 0; x < this.locations[depth].length; x++) {
        for (let y = 0; y < this.locations[depth][x].length; y++) {
          if (this.locations[depth][x][y] === locationId) {
            return [depth, x, y];
          }
        }
      }
    }

    return undefined;
  }

  getExitDirections(locationId: LocationId): [number, number, number][] {
    // Find the location, then find its exits

    const exits = this.exits[locationId];
    if (!exits) return [];

    const basePosition = this.getPosition(locationId);
    if (!basePosition) return [];

    const directions: [number, number, number][] = [];
    for (const exit of exits) {
      const direction: [number, number, number] = [
        exit[0] - basePosition[0],
        exit[1] - basePosition[1],
        exit[2] - basePosition[2],
      ];

      directions.push(direction);
    }

    return directions;
  }

  getDirection(
    from: LocationId,
    to: LocationId
  ): [number, number, number] | undefined {
    const fromPosition = this.getPosition(from);
    const toPosition = this.getPosition(to);

    if (!fromPosition || !toPosition) return undefined;

    return [
      toPosition[0] - fromPosition[0],
      toPosition[1] - fromPosition[1],
      toPosition[2] - fromPosition[2],
    ];
  }
}
