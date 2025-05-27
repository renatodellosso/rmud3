import { LocationId, Point } from "lib/types/types";
import { DungeonLocation, FloorDefinition, FloorInstance } from "./types";
import floors from "./Floors";

export function mapFloor(floor: (DungeonLocation | undefined)[][]): string {
  let map = "";

  for (let x = 0; x < floor.length; x++) {
    for (let y = 0; y < floor[x].length; y++) {
      const location = floor[x][y];
      if (location) {
        map += location.floor.definition.name.charAt(0).toUpperCase(); // Use first letter of location ID
      } else map += "."; // Empty space
    }

    map += "\n"; // New line after each row
  }

  return map;
}

export function getGlobalCoordsOfRoomsInFloor(floor: FloorInstance): Point[] {
  const globalCoords: Point[] = [];

  for (let x = 0; x < floor.size[0]; x++) {
    for (let y = 0; y < floor.size[1]; y++) {
      const location = floor.locations[x][y];
      if (location) {
        globalCoords.push(location.globalCoords);
      }
    }
  }

  return globalCoords;
}

export function floorDefinitionToId(
  definition: FloorDefinition
): keyof typeof floors {
  return Object.entries(floors).find(
    ([, floorDef]) => floorDef.name === definition.name
  )?.[0] as keyof typeof floors;
}

export function getLocationId(
  floor: FloorInstance,
  globalCoords: Point
): LocationId {
  return `dungeon-${floorDefinitionToId(floor.definition)}-${globalCoords.join(
    "-"
  )}-${floor.depth}`;
}

export function getCoordsFromId(id: LocationId) {
  const parts = id.split("-");
  if (parts.length < 5) {
    throw new Error(`Invalid LocationId: ${id}`);
  }

  const definitionId = parts[1] as keyof typeof floors;
  const coords = parts.slice(2, 4).map(Number);

  if (coords.length !== 2) {
    throw new Error(`Invalid LocationId: ${id}`);
  }

  return {
    depth: +parts[4],
    coords: coords as Point,
  };
}
