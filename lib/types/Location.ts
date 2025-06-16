// import locations from "lib/locations";
import { getFromOptionalFunc } from "lib/utils";
import { CreatureInstance } from "./creature";
import { PlayerInstance } from "./player";
import { OptionalFunc } from "./types";
import { getIo } from "lib/ClientFriendlyIo";
import { EntityInstance } from "./entity";
import { LocationId } from "lib/gamedata/rawLocations";

export class Location {
  id: LocationId;
  name: string;
  description?: OptionalFunc<string, [PlayerInstance]>;
  entities: Set<EntityInstance>;
  exits: Set<LocationId>;

  constructor() {
    this.id = "" as LocationId;
    this.name = "";
    this.entities = new Set<CreatureInstance>();
    this.exits = new Set<LocationId>();
  }

  enter(entity: EntityInstance) {
    console.log(`Creature ${entity.name} is entering location ${this.name}.`);

    this.entities.add(entity);
    entity.location = this.id;

    if (entity.definitionId === "player") {
      const io = getIo();
      const playerId = entity._id.toString();

      io.joinRoom(this.id, playerId);

      io.sendMsgToRoom(
        this.name,
        `${entity.name} has entered ${this.name}.`
      ).then(() => {
        if (this.description) {
          io.sendMsgToPlayer(
            playerId,
            getFromOptionalFunc(this.description, entity as PlayerInstance)
          );
        }

        io.updateGameState(playerId);
      });
    }
  }

  exit(entity: EntityInstance) {
    console.log(`Creature ${entity.name} is exiting location ${this.name}.`);

    this.entities.delete(entity);

    const io = getIo();

    if (entity.definitionId === "player") {
      io.leaveRoom(this.id, entity._id.toString());

      io.sendMsgToPlayer(
        entity._id.toString(),
        `You have left ${this.name}.`
      );
    }

    io.sendMsgToRoom(this.name, `${entity.name} has left ${this.name}.`);
  }
}
