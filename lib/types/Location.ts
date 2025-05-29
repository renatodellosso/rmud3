import locations from "lib/gamedata/locations";
import { CreatureInstance } from "./creature";
import { getSocket } from "lib/getSocketsByPlayerInstanceIds";
import { getSingleton } from "lib/utils";

export type LocationId = keyof typeof locations | `dungeon-${string}`;

export class Location {
  name: string;
  creatures: Set<CreatureInstance>;
  exits: Set<LocationId>;

  constructor() {
    this.name = "";
    this.creatures = new Set<CreatureInstance>();
    this.exits = new Set<LocationId>();
  }

  enter(creature: CreatureInstance) {
    getSocket(creature._id)?.rooms.add(this.name);

    this.creatures.add(creature);
  }
}
