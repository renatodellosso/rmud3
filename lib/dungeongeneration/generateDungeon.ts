import { chance, randInRangeInt } from "lib/utils";
import floors from "./Floors";
import {
  Dungeon,
  DungeonLocation,
  FloorDefinition,
  FloorInstance,
} from "./types";
import { Point } from "lib/types/types";

export default function generateDungeon(): Dungeon {
  const dungeon: Dungeon = {
    locations: [],
    floors: [],
  };

  let startingPoints: Point[] = [
    [0, 0], // Starting point for the first floor
  ];

  const maxDepth = Math.max(...Object.values(floors).map(floor => floor.depth));

  for (let depth = 0; depth <= maxDepth; depth++) {
    startingPoints = generateDepth(dungeon, depth, startingPoints);
  }

  return dungeon;
}

function generateDepth(dungeon: Dungeon, depth: number, startingPoints: Point[]): Point[] {
  const definitions: FloorDefinition[] = generateFloorDefinitionArray(depth);

  const floors = assignFloorStartingPoints(
    definitions,
    startingPoints
  );

  // Generate each floor
  const newStartingPoints: Point[] = [];

  for (const floor of floors) {
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

function generateFloorDefinitionArray(depth: number): FloorDefinition[] {
  const definitions: FloorDefinition[] = [];
  let blendChance = 1;

  while (chance(blendChance)) {
    const definition = selectFloorDefinition(depth);

    definitions.push(definition);
    blendChance *= definition.blendChance;
  }

  return definitions;
}

function selectFloorDefinition(depth: number): FloorDefinition {
  let totalWeight = 0;

  const floorDefinitions = Object.entries(floors)
    .filter(([_, floor]) => floor.depth === depth)
    .map(([id, floor]) => ({
      id,
      definition: floor,
    }))
    .reduce((table, curr) => {
      totalWeight += curr.definition.appearanceWeight;

      if (table.length === 0) {
        return [
          {
            weight: curr.definition.appearanceWeight,
            id: curr.id,
            definition: curr.definition,
          },
        ];
      }

      return table.concat({
        weight:
          table[table.length - 1].weight + curr.definition.appearanceWeight,
        id: curr.id,
        definition: curr.definition,
      });
    }, [] as { weight: number; id: keyof typeof floors; definition: FloorDefinition }[]);

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
  const { locations, dimensions, offsetStartingPoints } =
    initLocationArrays(dungeon, depth, definition, startingPoints);

  const floorInstance: FloorInstance = {
    definitionId: definition.name.toLowerCase() as keyof typeof floors,
    locations,
    size: dimensions,
    offset: [
      Math.min(...startingPoints.map((point) => point[0])),
      Math.min(...startingPoints.map((point) => point[1])),
    ]
  };

  dungeon.floors.push(floorInstance);

  const roomsToExpand = initStartingPoints(
    dungeon,
    depth,
    floorInstance,
    offsetStartingPoints,
    startingPoints
  );

  const rooms = generateFloorLayout(
    dungeon, floorInstance, roomsToExpand
  );

  return { floorInstance, rooms };
}

function generateExits(floor: FloorInstance, rooms: DungeonLocation[]): Point[] {
  const exitRange = floors[floor.definitionId].generationOptions.exitCount;
  const exitCount = randInRangeInt(exitRange[0], exitRange[1]);

  const startingPoints: Point[] = [];
  const availablePoints: Point[] = [...rooms.map(room => room.floorCoords)];
  for (let i = 0; i < exitCount; i++) {
    if (availablePoints.length === 0) {
      break; // No more available points to choose from
    }

    const randomIndex = randInRangeInt(0, availablePoints.length - 1);
    startingPoints.push(availablePoints[randomIndex]);
    availablePoints.splice(randomIndex, 1); // Remove the chosen point to avoid duplicates
  }

  if (startingPoints.length === 0) {
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

function generateRoom(dungeon: Dungeon, floor: FloorInstance, globalCoords: Point) {
  const location: DungeonLocation = {
    id: `dungeon-${floors[floor.definitionId].name.toLowerCase().replace(" ", "")}-${globalCoords.join("-")}`,
    name: `${floors[floor.definitionId].name} Room - ${globalCoords.join(", ")}`,
    creatures: [],
    floor,
    globalCoords: globalCoords,
    floorCoords: [
      globalCoords[0] - floor.offset[0],
      globalCoords[1] - floor.offset[1],
    ],
    exits: [],
  };

  return location;
}

function expand2DArray(
  array: any[][],
  newDimensions: [number, number]
) {
  const newArray: any[][] = Array.from(
    { length: newDimensions[0] },
    () => Array.from({ length: newDimensions[1] }, () => undefined)
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

function initStartingPoints(dungeon: Dungeon, depth: number, 
  floorInstance: FloorInstance, offsetStartingPoints: Point[], nonOffsetStartingPoints: Point[]): DungeonLocation[] {
    const roomsToExpand: DungeonLocation[] = [];

    // Initialize locations with starting points
    for (let i = 0; i < offsetStartingPoints.length; i++) {
      const offsetPoint = offsetStartingPoints[i];
      const nonOffsetPoint = nonOffsetStartingPoints[i];
  
      if (dungeon.locations[depth][nonOffsetPoint[0]][nonOffsetPoint[1]])
        continue; // Skip if the location is already defined
      else dungeon.locations[depth][nonOffsetPoint[0]][nonOffsetPoint[1]] = generateRoom(
        dungeon,
        floorInstance,
        nonOffsetPoint,
      );
  
      const room = dungeon.locations[depth][nonOffsetPoint[0]][nonOffsetPoint[1]];
  
      if (!room) {
        throw new Error(
          `Failed to generate room at ${nonOffsetPoint.join(", ")}`
        );
      }
  
      floorInstance.locations[offsetPoint[0]][offsetPoint[1]] = room;
  
      roomsToExpand.push(room);
    }

  return roomsToExpand;
}

function generateFloorLayout(
  dungeon: Dungeon,
  floorInstance: FloorInstance,
  roomsToExpand: DungeonLocation[]
): DungeonLocation[] {
  const options = floors[floorInstance.definitionId].generationOptions;
  const depth = floors[floorInstance.definitionId].depth;

  const rooms: DungeonLocation[] = [...roomsToExpand];

  const roomCount = randInRangeInt(
    options.roomCount[0],
    options.roomCount[1]
  );

  while (rooms.length < roomCount && rooms) {
    const room = rooms[0];

    const adjacentPoints: Point[] = [
      [room.floorCoords[0] - 1, room.floorCoords[1]],
      [room.floorCoords[0] + 1, room.floorCoords[1]],
      [room.floorCoords[0], room.floorCoords[1] - 1],
      [room.floorCoords[0], room.floorCoords[1] + 1],
    ];

    const validAdjacentPoints = adjacentPoints.filter(
      (point) =>
        point[0] >= 0 &&
        point[1] >= 0 &&
        point[0] < floorInstance.size[0] &&
        point[1] < floorInstance.size[1]
    );

    const emptyAdjacentPoints = validAdjacentPoints.filter(
      (point) =>
        !dungeon.locations[depth][floorInstance.offset[0] + point[0]][floorInstance.offset[1] + point[1]]
    );

    const filledAdjacentPoints = validAdjacentPoints.filter(
      (point) =>
        dungeon.locations[depth][floorInstance.offset[0] + point[0]][floorInstance.offset[1] + point[1]]
    );
    
    for (const point of emptyAdjacentPoints) {
      if (chance(options.roomChance)) {
        const newRoom = generateRoom(
          dungeon,
          floorInstance,
          [
            point[0] + floorInstance.offset[0],
            point[1] + floorInstance.offset[1],
          ]
        );

        newRoom.exits.push(room.id);
        room.exits.push(newRoom.id);

        rooms.push(newRoom);
      }
    }

    for (const point of filledAdjacentPoints) {
      if (chance(options.connectionChance)) {
        const existingRoom = dungeon.locations[depth][floorInstance.offset[0] + point[0]][floorInstance.offset[1] + point[1]];
        
        if (!existingRoom) {
          throw new Error(
            `No existing room found at ${point.join(", ")} for connection when one should exist.`
          );
        }

        existingRoom.exits.push(room.id);
        room.exits.push(existingRoom.id);
      }
    }
  }

  // Retry if we didn't generate enough rooms
  if (rooms.length < roomCount) {
    return generateFloorLayout(dungeon, floorInstance, rooms);
  }

  return rooms;
}