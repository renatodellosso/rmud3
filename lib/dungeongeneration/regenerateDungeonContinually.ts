import { LocationId } from "lib/gamedata/rawLocations";
import locations from "lib/locations";
import { Point } from "lib/types/types";
import { chance } from "lib/utils";
import { generateRoom } from "./generateDungeonLayout";
import { populateRoom } from "./populateDungeon";
import { Dungeon, DungeonLocation, FloorInstance } from "./types";

const ROOM_DELETION_CHANCE = 0.00004;
const EXIT_DELETION_CHANCE = 0.0005;
const NEW_ROOM_CHANCE = 0.01;
const NEW_EXIT_CHANCE = 0.01;
const VERTICAL_EXIT_MULTIPLIER = 0.5;

const ADJACENCY = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

export function regenerateDungeonContinually(
  dungeon: Dungeon,
  deltaTime: number
) {
  // console.time("Regenerated Dungeon");

  randomlyDeleteRooms(dungeon, deltaTime);
  randomlyDeleteExits(dungeon, deltaTime);
  randomlyGenerateNewRooms(dungeon, deltaTime);
  randomlyGenerateNewExits(dungeon, deltaTime);

  // console.timeEnd("Regenerated Dungeon");
}

function getAdjacentCoords(dungeon: Dungeon, coords: [number, number, number]) {
  const [depth, x, y] = coords;
  const adjacentCoords: [number, number, number][] = [];

  for (const [dx, dy, dz] of ADJACENCY) {
    const newDepth = depth + dz;
    const newX = x + dx;
    const newY = y + dy;

    if (
      newDepth >= 0 &&
      newDepth < dungeon.locations.length &&
      newX >= 0 &&
      newX < dungeon.locations[newDepth].length &&
      newY >= 0 &&
      newY < dungeon.locations[newDepth][newX].length
    ) {
      adjacentCoords.push([newDepth, newX, newY]);
    }
  }

  return adjacentCoords;
}

function getAdjacentRooms(
  dungeon: Dungeon,
  coords: [number, number, number]
): DungeonLocation[] {
  const adjacentRooms: DungeonLocation[] = [];

  const adjacentCoords = getAdjacentCoords(dungeon, coords);
  for (const [adjDepth, adjX, adjY] of adjacentCoords) {
    const room = dungeon.locations[adjDepth][adjX][adjY];

    if (room) {
      adjacentRooms.push(room);
    }
  }

  return adjacentRooms;
}

function getAdjacentEmptyCoords(
  dungeon: Dungeon,
  coords: [number, number, number]
): Point[] {
  const [depth, x, y] = coords;
  const emptyCoords: Point[] = [];

  const adjacentCoords = getAdjacentCoords(dungeon, coords);
  for (const [adjX, adjY] of adjacentCoords) {
    if (!dungeon.locations[depth][adjX][adjY]) {
      emptyCoords.push([adjX, adjY]);
    }
  }

  return emptyCoords;
}

function isAPlayerinRoomOrAdjacentRooms(
  dungeon: Dungeon,
  coords: [number, number, number]
) {
  const [depth, x, y] = coords;

  // Check the room itself
  const room = dungeon.locations[depth][x][y];
  if (
    room &&
    Array.from(room.entities).some((e) => e.definitionId === "player")
  )
    return true;

  // Check adjacent rooms
  for (const adjacentRoom of getAdjacentRooms(dungeon, coords)) {
    if (
      adjacentRoom &&
      Array.from(adjacentRoom.entities).some((e) => e.definitionId === "player")
    )
      return true;
  }

  return false;
}

function randomlyDeleteRooms(dungeon: Dungeon, deltaTime: number) {
  for (let depth = 0; depth < dungeon.locations.length; depth++) {
    for (let x = 0; x < dungeon.locations[depth].length; x++) {
      for (let y = 0; y < dungeon.locations[depth][x].length; y++) {
        const oldRoom = dungeon.locations[depth][x][y];

        if (!oldRoom) continue;
        if (
          oldRoom.floor.roomCount <=
          oldRoom.floor.definition.layoutGenerationOptions.roomCount[0]
        )
          if (Array.from(oldRoom.exits).some((e) => e == "dungeon-entrance"))
            continue;
        if (isAPlayerinRoomOrAdjacentRooms(dungeon, [depth, x, y])) continue;
        if (!chance(ROOM_DELETION_CHANCE * deltaTime)) continue;

        deleteRoom(dungeon, oldRoom.id);
      }
    }
  }
}

function deleteRoom(dungeon: Dungeon, roomId: LocationId) {
  const room = locations[roomId] as DungeonLocation;
  if (!room) return;

  // Remove exits leading to this room
  const exits = Array.from(room.exits).map((e) => locations[e]);
  for (const exit of exits) {
    if (!exit || !exit.exits) continue;
    exit.exits.delete(room.id);
  }

  delete locations[room.id];
  room.floor.roomCount--;
  room.floor.locations[room.floorCoords[0]][room.floorCoords[1]] = undefined;
  dungeon.locations[room.floor.depth][room.globalCoords[0]][
    room.globalCoords[1]
  ] = undefined;
}

function randomlyDeleteExits(dungeon: Dungeon, deltaTime: number) {
  for (let depth = 0; depth < dungeon.locations.length; depth++) {
    for (let x = 0; x < dungeon.locations[depth].length; x++) {
      for (let y = 0; y < dungeon.locations[depth][x].length; y++) {
        const room = dungeon.locations[depth][x][y];
        if (!room) continue;
        if (isAPlayerinRoomOrAdjacentRooms(dungeon, [depth, x, y])) continue;

        const exits = Array.from(room.exits);
        for (const exitId of exits) {
          if (
            !exitId.startsWith("dungeon-") ||
            exitId.startsWith("dungeon-entrance")
          )
            continue;
          if (!chance(EXIT_DELETION_CHANCE * deltaTime)) continue;

          const exitRoom = locations[exitId] as DungeonLocation;
          if (!exitRoom) continue;

          room.exits.delete(exitId);
          exitRoom.exits.delete(room.id);
        }
      }
    }
  }
}

function randomlyGenerateNewRooms(dungeon: Dungeon, deltaTime: number) {
  for (let depth = 0; depth < dungeon.locations.length; depth++) {
    for (let x = 0; x < dungeon.locations[depth].length; x++) {
      for (let y = 0; y < dungeon.locations[depth][x].length; y++) {
        const room = dungeon.locations[depth][x][y];
        if (!room) continue;
        if (isAPlayerinRoomOrAdjacentRooms(dungeon, [depth, x, y])) continue;

        for (const coord of getAdjacentEmptyCoords(dungeon, [depth, x, y])) {
          // Check if coord is out of bounds for the floor
          const floorCoords = [
            coord[0] - room.floor.offset[0],
            coord[1] - room.floor.offset[1],
          ];

          if (
            floorCoords[0] < 0 ||
            floorCoords[0] >= room.floor.size[0] ||
            floorCoords[1] < 0 ||
            floorCoords[1] >= room.floor.size[1]
          )
            continue;

          if (coord[0] === x && coord[1] === y) continue;

          if (
            !chance(NEW_ROOM_CHANCE * deltaTime) ||
            !chance(room.floor.definition.layoutGenerationOptions.roomChance)
          )
            continue;

          // Generate a new room at the empty coordinate
          generateNewRoom(dungeon, room.floor, coord);
        }
      }
    }
  }
}

function generateNewRoom(
  dungeon: Dungeon,
  floor: FloorInstance,
  coords: Point
) {
  const room = generateRoom(dungeon, floor, coords);
  locations[room.id] = room;

  // Find adjacent rooms to connect exits
  const adjacentRooms = getAdjacentRooms(dungeon, [
    floor.depth,
    coords[0],
    coords[1],
  ]).filter((r) => r && r.id !== room.id);

  for (const adjacentRoom of adjacentRooms) {
    if (!adjacentRoom) continue;
    if (!chance(floor.definition.layoutGenerationOptions.connectionChance))
      continue;

    // Connect exits between the new room and the adjacent room
    room.exits.add(adjacentRoom.id);
    adjacentRoom.exits.add(room.id);
  }

  populateRoom(floor, room);
}

function randomlyGenerateNewExits(dungeon: Dungeon, deltaTime: number) {
  for (let depth = 0; depth < dungeon.locations.length; depth++) {
    for (let x = 0; x < dungeon.locations[depth].length; x++) {
      for (let y = 0; y < dungeon.locations[depth][x].length; y++) {
        const room = dungeon.locations[depth][x][y];
        if (!room) continue;
        if (isAPlayerinRoomOrAdjacentRooms(dungeon, [depth, x, y])) continue;

        for (const adjacentRoom of getAdjacentRooms(dungeon, [depth, x, y])) {
          if (
            !chance(
              NEW_EXIT_CHANCE *
                deltaTime *
                (adjacentRoom.floor != room.floor
                  ? VERTICAL_EXIT_MULTIPLIER
                  : 1)
            ) ||
            !chance(
              room.floor.definition.layoutGenerationOptions.connectionChance
            )
          )
            continue;

          // Create a new exit to the adjacent room
          if (!adjacentRoom) continue;

          room.exits.add(room.id);
          adjacentRoom.exits.add(room.id);
        }
      }
    }
  }
}
