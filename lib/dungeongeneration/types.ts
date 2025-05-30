import { Range, Point } from "../types/types";
import { Location, LocationId } from "../types/Location";

export type Dungeon = {
  locations: (DungeonLocation | undefined)[][][];

  floors: FloorInstance[];
};

export type FloorInstance = {
  definition: FloorDefinition;
  locations: (DungeonLocation | undefined)[][];
  depth: number;
  size: [number, number];
  offset: Point;
};

export type FloorDefinition = {
  name: string;
  /**
   * Depth values the floor can appear on
   */
  depths: number[];
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

export class DungeonLocation extends Location {
  floor: FloorInstance;
  globalCoords: Point;
  floorCoords: Point;

  constructor() {
    super();
    this.id = undefined as any;
    this.floor = {} as FloorInstance;
    this.globalCoords = [0, 0];
    this.floorCoords = [0, 0];
  }
}

export class MissingRoomsError extends Error {
  constructor(msg: string, public missingRooms: Point[]) {
    super(
      `${msg} Missing Rooms: ${missingRooms
        .map((p) => `(${p[0]}, ${p[1]})`)
        .join(", ")}`
    );
    this.name = "MissingRoomsError";
  }
}
