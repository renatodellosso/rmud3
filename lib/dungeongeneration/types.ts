import locations from "../gamedata/locations";
import { Range, Location, Point, LocationId } from "../types/types";

export type Dungeon = {
  locations: (DungeonLocation | undefined)[][][];

  floors: FloorInstance[];
};

export type FloorInstance = {
  definition: FloorDefinition;
  locations: (DungeonLocation | undefined)[][];
  size: [number, number];
  offset: Point;
};

export type FloorDefinition = {
  name: string;
  depth: number;
  /**
   * How likely this floor is to appear in a dungeon.
   * Higher values mean more likely.
   */
  appearanceWeight: number;
  generationOptions: FloorGenerationOptions;
  /**
   * How likely a second floor is to be generated on the same depth.
   */
  blendChance: number;
  visualizerColor: string;
};

export type FloorGenerationOptions = {
  roomChance: number;
  connectionChance: number;
  width: Range;
  length: Range;
  roomCount: Range;
  exitCount: Range;
};

export type DungeonLocation = Location & {
  id: LocationId;
  floor: FloorInstance;
  globalCoords: Point;
  floorCoords: Point;
};
