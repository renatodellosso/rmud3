import { chance, randInRangeInt } from "lib/utils";
import floors from "./Floors";
import {
  Dungeon,
  DungeonLocation,
  FloorDefinition,
  FloorInstance,
} from "./types";
import { Point } from "lib/types/types";
import { getLocationId, mapFloor } from "./utils";

export default function generateDungeon(): Dungeon {
  const dungeon: Dungeon = {
    locations: [],
    floors: [],
  };

  let startingPoints: Point[] = [
    [0, 0], // Starting point for the first floor
  ];

  const maxDepth = Math.max(
    ...Object.values(floors).map((floor) => Math.max(...Object.values(floor.depths).map((depth) => depth)))
  );
  if (maxDepth < 0) {
    throw new Error("No valid floor definitions found.");
  }

  for (let depth = 0; depth <= maxDepth; depth++) {
    // Generate all floors at this depth
    const newStartingPoints = generateDepth(dungeon, depth, startingPoints);

    if (depth > 0) {
      // Connect the current floor to the previous one
      connectFloors(dungeon, depth, startingPoints);
    }

    startingPoints = newStartingPoints;
  }

  return dungeon;
}

function generateDepth(
  dungeon: Dungeon,
  depth: number,
  startingPoints: Point[]
): Point[] {
  const definitions: FloorDefinition[] = generateFloorDefinitionArray(depth);

  const floors = assignFloorStartingPoints(definitions, startingPoints);

  // Generate each floor
  const newStartingPoints: Point[] = [];

  for (const floor of floors) {
    if (floor.startingPoints.length === 0) continue;

    const { floorInstance, rooms } = generateFloor(
      dungeon,
      floor.definition,
      floor.startingPoints,
      depth
    );

    // Generate exits for the floor
    const exits = generateExits(floorInstance, rooms);
    newStartingPoints.push(...exits);
  }

  return newStartingPoints;
}

function connectFloors(dungeon: Dungeon, lowerDepth: number, points: Point[]) {
  for (const point of points) {
    const lowerRoom = dungeon.locations[lowerDepth][point[0]]?.[point[1]];
    const upperRoom = dungeon.locations[lowerDepth - 1][point[0]]?.[point[1]];

    if (!lowerRoom || !upperRoom) {
      continue;
    }

    lowerRoom.exits.add(upperRoom.id);
    upperRoom.exits.add(lowerRoom.id);
  }
}

function generateFloorDefinitionArray(depth: number): FloorDefinition[] {
  const definitions: Set<FloorDefinition> = new Set(); // Use a Set to avoid duplicates
  let blendChance = 1;

  while (chance(blendChance)) {
    const definition = selectFloorDefinition(depth);

    definitions.add(definition);
    blendChance *= definition.blendChance;
  }

  return Array.from(definitions);
}

function selectFloorDefinition(depth: number): FloorDefinition {
  let totalWeight = 0;

  const floorDefinitions = Object.values(floors)
    .filter((floor) => floor.depths.includes(depth))
    .reduce((table, curr) => {
      totalWeight += curr.appearanceWeight;

      if (table.length === 0) {
        return [
          {
            weight: curr.appearanceWeight,
            definition: curr,
          },
        ];
      }

      return table.concat({
        weight: table[table.length - 1].weight + curr.appearanceWeight,
        definition: curr,
      });
    }, [] as { weight: number; definition: FloorDefinition }[]);

  const randomValue = Math.random() * totalWeight;
  for (const floor of floorDefinitions) {
    if (randomValue < floor.weight) {
      return floor.definition;
    }
  }

  throw new Error(`No floor definition found for depth ${depth}`);
}

function assignFloorStartingPoints(
  definitions: FloorDefinition[],
  startingPoints: Point[]
): { definition: FloorDefinition; startingPoints: Point[] }[] {
  // For each definition, pick a random starting point
  const eligibleFloorStartingPoints = [...startingPoints];
  const floorStartingPoints: Point[] = [];
  for (let i = 0; i < definitions.length; i++) {
    if (eligibleFloorStartingPoints.length === 0) {
      continue;
    }

    const randomIndex = randInRangeInt(
      0,
      eligibleFloorStartingPoints.length - 1
    );
    const startingPoint = eligibleFloorStartingPoints[randomIndex];
    floorStartingPoints.push(startingPoint);
    eligibleFloorStartingPoints.splice(randomIndex, 1); // Remove the chosen point to avoid duplicates
  }

  // Assign each starting point to a floor definition based on how close it is to the selected starting points
  const floors: { definition: FloorDefinition; startingPoints: Point[] }[] =
    definitions
      .slice(0, floorStartingPoints.length)
      .map((definition, index) => ({
        definition,
        startingPoints: [floorStartingPoints[index]],
      }));

  for (const startingPoint of eligibleFloorStartingPoints) {
    const closestFloor = floors.reduce((closest, current) => {
      const closestDistance = Math.hypot(
        closest.startingPoints[0][0] - startingPoint[0],
        closest.startingPoints[0][1] - startingPoint[1]
      );
      const currentDistance = Math.hypot(
        current.startingPoints[0][0] - startingPoint[0],
        current.startingPoints[0][1] - startingPoint[1]
      );

      return currentDistance < closestDistance ? current : closest;
    });

    closestFloor.startingPoints.push(startingPoint);
  }

  return floors;
}

function generateFloor(
  dungeon: Dungeon,
  definition: FloorDefinition,
  startingPoints: Point[],
  depth: number
): { floorInstance: FloorInstance; rooms: DungeonLocation[] } {
  if (startingPoints.length === 0) {
    throw new Error(
      `No starting points provided for floor: ${definition.name}`
    );
  }

  const { locations, dimensions, offsetStartingPoints } = initLocationArrays(
    dungeon,
    depth,
    definition,
    startingPoints
  );

  const floorInstance: FloorInstance = {
    definition,
    locations,
    size: dimensions,
    offset: [
      Math.min(...startingPoints.map((point) => point[0])),
      Math.min(...startingPoints.map((point) => point[1])),
    ],
  };

  dungeon.floors.push(floorInstance);

  const roomsToExpand = initStartingRooms(
    dungeon,
    depth,
    floorInstance,
    offsetStartingPoints,
    startingPoints
  );

  const rooms = generateFloorLayout(dungeon, depth, floorInstance, roomsToExpand);

  return { floorInstance, rooms };
}

function generateExits(
  floor: FloorInstance,
  rooms: DungeonLocation[]
): Point[] {
  const exitRange = floor.definition.generationOptions.exitCount;
  const exitCount = randInRangeInt(exitRange[0], exitRange[1]);

  const startingPoints: Point[] = [];
  const availablePoints: Point[] = [...rooms.map((room) => room.globalCoords)];
  for (let i = 0; i < exitCount; i++) {
    if (availablePoints.length === 0) {
      break; // No more available points to choose from
    }

    const randomIndex = randInRangeInt(0, availablePoints.length - 1);
    startingPoints.push(availablePoints[randomIndex]);
    availablePoints.splice(randomIndex, 1); // Remove the chosen point to avoid duplicates
  }

  if (startingPoints.length === 0) {
    console.warn(
      "Rooms:",
      rooms.map((room) => room.globalCoords),
      "Exit Count:",
      exitCount
    );
    throw new Error("No starting points generated for the floor.");
  }

  return startingPoints;
}

function generateFloorDimensionsAndOffsetStartingPoints(
  definition: FloorDefinition,
  startingPoints: Point[]
): { dimensions: [number, number]; offsetStartingPoints: Point[] } {
  const maxWidthBetweenStartingPoints =
    Math.max(...startingPoints.map((point) => point[0])) -
    Math.min(...startingPoints.map((point) => point[0]));

  const maxLengthBetweenStartingPoints =
    Math.max(...startingPoints.map((point) => point[1])) -
    Math.min(...startingPoints.map((point) => point[1]));

  const width = Math.max(
    randInRangeInt(
      definition.generationOptions.width[0],
      definition.generationOptions.width[1]
    ),
    maxWidthBetweenStartingPoints
  );
  const length = Math.max(
    randInRangeInt(
      definition.generationOptions.length[0],
      definition.generationOptions.length[1]
    ),
    maxLengthBetweenStartingPoints
  );

  const dimensions: [number, number] = [width, length];

  // Offset starting points to ensure they fit within the generated floor dimensions
  const offsetStartingPoints = startingPoints.map(
    (point) =>
      [
        point[0] - Math.min(...startingPoints.map((p) => p[0])),
        point[1] - Math.min(...startingPoints.map((p) => p[1])),
      ] as Point
  );

  // Offset points randomly within the floor dimensions
  const offsetX =
    width - maxWidthBetweenStartingPoints
      ? randInRangeInt(0, width - maxWidthBetweenStartingPoints - 1)
      : 0;
  const offsetY =
    length - maxLengthBetweenStartingPoints
      ? randInRangeInt(0, length - maxLengthBetweenStartingPoints - 1)
      : 0;

  for (const point of offsetStartingPoints) {
    point[0] += offsetX;
    point[1] += offsetY;

    // Verify that the offset points are within the dimensions
    if (
      point[0] < 0 ||
      point[1] < 0 ||
      point[0] >= dimensions[0] ||
      point[1] >= dimensions[1]
    ) {
      throw new Error(
        `Offset starting point ${point.join(
          ", "
        )} is out of bounds for dimensions ${dimensions.join(", ")}.`
      );
    }
  }

  return { dimensions, offsetStartingPoints };
}

function initLocationArrays(
  dungeon: Dungeon,
  depth: number,
  definition: FloorDefinition,
  startingPoints: Point[]
): {
  locations: (DungeonLocation | undefined)[][];
  dimensions: [number, number];
  offsetStartingPoints: Point[];
} {
  const { dimensions, offsetStartingPoints } =
    generateFloorDimensionsAndOffsetStartingPoints(definition, startingPoints);

  // Initialize the locations array for the floor
  const locations: (DungeonLocation | undefined)[][] = Array.from(
    { length: dimensions[0] },
    () => Array.from({ length: dimensions[1] }, () => undefined)
  );

  // Ensure the dungeon has enough depth for the new floor
  if (dungeon.locations.length <= depth) {
    dungeon.locations.push([]);
  }

  // Expand the dungeon locations array to accommodate the new floor
  dungeon.locations[depth] = expand2DArray(dungeon.locations[depth], [
    dimensions[0] + Math.min(...startingPoints.map((p) => p[0])),
    dimensions[1] + Math.min(...startingPoints.map((p) => p[1])),
  ]);

  return { locations, dimensions, offsetStartingPoints };
}

function generateRoom(
  dungeon: Dungeon,
  floor: FloorInstance,
  depth: number,
  globalCoords: Point
) {
  const location: DungeonLocation = {
    id: getLocationId(floor, globalCoords),
    name: `${floor.definition.name} Room - ${globalCoords.join(", ")}`,
    creatures: [],
    floor,
    globalCoords: globalCoords,
    floorCoords: [
      globalCoords[0] - floor.offset[0],
      globalCoords[1] - floor.offset[1],
    ],
    exits: new Set(),
  };

  floor.locations[location.floorCoords[0]][location.floorCoords[1]] = location;
  dungeon.locations[depth][location.globalCoords[0]][
    location.globalCoords[1]
  ] = location;

  return location;
}

function expand2DArray(array: any[][], newDimensions: [number, number]) {
  const newArray: any[][] = Array.from({ length: newDimensions[0] }, () =>
    Array.from({ length: newDimensions[1] }, () => undefined)
  );

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (i < newDimensions[0] && j < newDimensions[1]) {
        newArray[i][j] = array[i][j];
      }
    }
  }

  return newArray;
}

function initStartingRooms(
  dungeon: Dungeon,
  depth: number,
  floorInstance: FloorInstance,
  offsetStartingPoints: Point[],
  nonOffsetStartingPoints: Point[]
): DungeonLocation[] {
  if (offsetStartingPoints.length !== nonOffsetStartingPoints.length) {
    throw new Error(
      `Offset starting points and non-offset starting points must have the same length. Got ${offsetStartingPoints.length} and ${nonOffsetStartingPoints.length}.`
    );
  }

  if (offsetStartingPoints.length === 0) {
    throw new Error(
      `No starting points provided for floor ${floorInstance.definition.name} at depth ${depth}.`
    );
  }

  const roomsToExpand: DungeonLocation[] = [];

  // Initialize locations with starting points
  for (let i = 0; i < offsetStartingPoints.length; i++) {
    const offsetPoint = offsetStartingPoints[i];
    const nonOffsetPoint = nonOffsetStartingPoints[i];

    if (!dungeon.locations[depth][nonOffsetPoint[0]][nonOffsetPoint[1]])
      dungeon.locations[depth][nonOffsetPoint[0]][nonOffsetPoint[1]] =
        generateRoom(dungeon, floorInstance, depth, nonOffsetPoint);

    const room = dungeon.locations[depth][nonOffsetPoint[0]][nonOffsetPoint[1]];

    if (!room) {
      throw new Error(
        `Failed to generate or find room at ${nonOffsetPoint.join(", ")}`
      );
    }

    floorInstance.locations[offsetPoint[0]][offsetPoint[1]] = room;

    roomsToExpand.push(room);
  }

  if (roomsToExpand.length === 0) {
    throw new Error(
      `No starting rooms generated for floor ${floorInstance.definition.name} at depth ${depth}.`
    );
  }

  return roomsToExpand;
}

function generateFloorLayout(
  dungeon: Dungeon,
  depth: number,
  floorInstance: FloorInstance,
  startingRooms: DungeonLocation[],
  retries: number = 5,
  lowerRoomCountBy = 0
): DungeonLocation[] {
  if (startingRooms.length === 0) {
    throw new Error(
      `No starting rooms provided for floor ${floorInstance.definition.name} at depth ${floorInstance.offset[0]}.`
    );
  }

  const options = floorInstance.definition.generationOptions;

  const roomsToExpand: DungeonLocation[] = [...startingRooms];
  const rooms: DungeonLocation[] = [...roomsToExpand];

  const roomCount =
    randInRangeInt(options.roomCount[0], options.roomCount[1]) -
    lowerRoomCountBy;

  while (rooms.length < roomCount && roomsToExpand.length > 0) {
    const room = roomsToExpand.shift();

    if (!room) {
      throw new Error("No room available to expand.");
    }

    const adjacentPoints: Point[] = [
      [room.globalCoords[0] - 1, room.globalCoords[1]],
      [room.globalCoords[0] + 1, room.globalCoords[1]],
      [room.globalCoords[0], room.globalCoords[1] - 1],
      [room.globalCoords[0], room.globalCoords[1] + 1],
    ];

    const validAdjacentPoints = adjacentPoints
      .filter(
        (point) =>
          // In global bounds
          point[0] >= 0 &&
          point[1] >= 0 &&
          point[0] < dungeon.locations[depth].length &&
          point[1] < dungeon.locations[depth][point[0]].length
      )
      .filter(
        (point) =>
          // In floor bounds
          point[0] - floorInstance.offset[0] >= 0 &&
          point[1] - floorInstance.offset[1] >= 0 &&
          point[0] - floorInstance.offset[0] < floorInstance.size[0] &&
          point[1] - floorInstance.offset[1] < floorInstance.size[1]
      );

    const emptyAdjacentPoints = validAdjacentPoints.filter(
      (point) => !dungeon.locations[depth][point[0]][point[1]]
    );

    const filledAdjacentPoints = validAdjacentPoints.filter(
      (point) =>
        dungeon.locations[depth][point[0]][point[1]] &&
        !room.exits.has(dungeon.locations[depth][point[0]][point[1]]!.id)
    );

    for (const point of emptyAdjacentPoints) {
      if (chance(options.roomChance)) {
        const newRoom = generateRoom(dungeon, floorInstance, depth, [
          point[0],
          point[1],
        ]);

        const posDist =
          Math.abs(newRoom.globalCoords[0] - room.globalCoords[0]) +
          Math.abs(newRoom.globalCoords[1] - room.globalCoords[1]);
        if (posDist > 1) {
          throw new Error(
            `New room at ${newRoom.globalCoords.join(
              ", "
            )} is not adjacent to the existing room at ${room.globalCoords.join(
              ", "
            )}.`
          );
        }

        newRoom.exits.add(room.id);
        room.exits.add(newRoom.id);

        rooms.push(newRoom);
      }
    }

    for (const point of filledAdjacentPoints) {
      if (chance(options.connectionChance)) {
        const existingRoom = dungeon.locations[depth][point[0]][point[1]];

        if (!existingRoom) {
          throw new Error(
            `No existing room found at ${point.join(
              ", "
            )} for connection when one should exist.`
          );
        }

        const posDist =
          Math.abs(existingRoom.globalCoords[0] - room.globalCoords[0]) +
          Math.abs(existingRoom.globalCoords[1] - room.globalCoords[1]);
        if (posDist > 1) {
          throw new Error(
            `New room at ${existingRoom.globalCoords.join(
              ", "
            )} is not adjacent to the existing room at ${room.globalCoords.join(
              ", "
            )}.`
          );
        }

        existingRoom.exits.add(room.id);
        room.exits.add(existingRoom.id);
      }
    }
  }

  // Retry if we didn't generate enough rooms
  if (rooms.length < roomCount && retries > 0) {
    return generateFloorLayout(
      dungeon,
      depth,
      floorInstance,
      rooms,
      retries - 1,
      rooms.length
    );
  }

  if (rooms.length == 0)
    throw new Error(
      `No rooms generated for floor ${
        floorInstance.definition.name
      } at depth ${depth}. Map:\n${mapFloor(
        dungeon.locations[depth]
      )}\nStarting Points: ${startingRooms}`
    );

  return rooms;
}
