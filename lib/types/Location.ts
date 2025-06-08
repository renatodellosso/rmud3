// import locations from "lib/locations";
import { getFromOptionalFunc } from "lib/utils";
import { CreatureInstance } from "./creature";
import { PlayerInstance } from "./player";
import { OptionalFunc } from "./types";
import { getIo } from "lib/ClientFriendlyIo";

export type LocationId =
  | "docks"
  | "town-square"
  | "dungeon-entrance"
  | "training-ground"
  | `dungeon-${string}`;

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
      const io = getIo();
      const playerId = creature._id.toString();

      io.joinRoom(this.id, playerId);

      io.sendMsgToRoom(
        this.name,
        `${creature.name} has entered ${this.name}.`
      ).then(() => {
        if (this.description) {
          io.sendMsgToPlayer(
            playerId,
            getFromOptionalFunc(this.description, creature as PlayerInstance)
          );
        }

        io.updateGameState(playerId);
      });
    }
  }

  exit(creature: CreatureInstance) {
    console.log(`Creature ${creature.name} is exiting location ${this.name}.`);

    this.creatures.delete(creature);

    const io = getIo();

    if (creature.definitionId === "player") {
      io.leaveRoom(this.id, creature._id.toString());

      io.sendMsgToPlayer(
        creature._id.toString(),
        `You have left ${this.name}.`
      );
    }

    io.sendMsgToRoom(this.name, `${creature.name} has left ${this.name}.`);
  }
}
