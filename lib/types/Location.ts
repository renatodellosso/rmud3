// import locations from "lib/locations";
import { CreatureInstance } from "./creature";
import { PlayerInstance } from "./player";
import { OptionalFunc } from "./types";

export type LocationId =
  | "docks"
  | "town-square"
  | "dungeon-entrance"
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
}
