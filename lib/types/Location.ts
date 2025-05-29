import locations from "lib/gamedata/locations";
import { CreatureInstance } from "./creature";
import { getSocket } from "lib/getSocketsByPlayerInstanceIds";
import { getFromOptionalFunc, getSingleton } from "lib/utils";
import {
  getIo,
  sendMsgToPlayer as sendMsgToSocket,
  sendMsgToRoom,
  TypedServer,
} from "./socketioserverutils";
import { PlayerInstance } from "./player";
import { OptionalFunc } from "./types";

export type LocationId = keyof typeof locations | `dungeon-${string}`;

export class Location {
  id: LocationId;
  name: string;
  description?: OptionalFunc<string, [PlayerInstance]>;
  creatures: Set<CreatureInstance>;
  exits: Set<LocationId>;

  constructor() {
    this.id = "" as LocationId;
    this.name = "";
    this.creatures = new Set<CreatureInstance>();
    this.exits = new Set<LocationId>();
  }

  enter(creature: CreatureInstance) {
    console.log(`Creature ${creature.name} is entering location ${this.name}.`);

    this.creatures.add(creature);
    creature.location = this.id;

    if (creature.definitionId === "player") {
      const socket = getSocket(creature._id);
      if (!socket) {
        console.warn(
          `No socket found for player ${creature.name} (${creature._id}). Cannot enter location.`
        );
        return;
      }

      socket.join(this.id);

      sendMsgToRoom(
        this.name,
        `${creature.name} has entered ${this.name}.`
      ).then(() => {
        if (this.description) {
          sendMsgToSocket(
            socket,
            getFromOptionalFunc(this.description, creature as PlayerInstance)
          );
        }
      });
    }
  }

  exit(creature: CreatureInstance) {
    console.log(`Creature ${creature.name} is exiting location ${this.name}.`);

    this.creatures.delete(creature);

    if (creature.definitionId === "player") {
      const socket = getSocket(creature._id);
      if (!socket) {
        console.warn(
          `No socket found for player ${creature.name} (${creature._id}). Cannot exit location.`
        );
        return;
      }

      socket.leave(this.id);

      sendMsgToRoom(this.name, `${creature.name} has left ${this.name}.`).then(
        () => {
          sendMsgToSocket(socket, `You have left ${this.name}.`);
        }
      );
    }
  }
}
