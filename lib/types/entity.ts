import entities, { EntityId } from "lib/gamedata/entities";
import { ObjectId } from "bson";
import locations from "lib/locations";
import { savePlayer } from "lib/utils";
import { PlayerInstance } from "./player";
import { LocationId } from "lib/gamedata/rawLocations";

export type EntityDefinition = {
  name: string;
  /**
   * @param deltaTime in seconds
   */
  tick?: (creature: EntityInstance, deltaTime: number) => void;
};

export class EntityInstance {
  _id: ObjectId = new ObjectId();

  definitionId: EntityId = undefined as unknown as EntityId;

  name: string = undefined as unknown as string;
  location: LocationId = undefined as unknown as LocationId;

  constructor(
    definitionId: EntityId = undefined as any,
    locationId: LocationId = undefined as any,
    name: string = undefined as any
  ) {
    this.location = locationId;
    this.name = name;

    this.definitionId = definitionId;
    const definition = entities[definitionId];
    if (!definition) {
      return;
    }

    this.name ??= definition.name;
  }

  move(newLocationId: LocationId) {
    if (!locations[newLocationId]) {
      throw new Error(`Invalid location ID: ${newLocationId}`);
    }

    const currentLocation = locations[this.location];
    if (!currentLocation.exits.has(newLocationId)) {
      throw new Error(
        `Cannot move to ${newLocationId} from ${this.location}. No exit available.`
      );
    }

    currentLocation.exit(this);
    const newLocation = locations[newLocationId];
    newLocation.enter(this);

    if (this.definitionId === "player") {
      savePlayer(this as unknown as PlayerInstance);
    }

    console.log(
      `Creature ${this.name} moved from ${currentLocation.name} to ${this.location}.`
    );
  }
}
