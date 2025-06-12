import { OmitType } from "lib/types/types";
import { Location, LocationId } from "../types/Location";
import { restoreFieldsAndMethods } from "lib/utils";
import { CreatureInstance } from "lib/types/creature";

const rawLocations: Partial<OmitType<Location, Function>>[] = [
  {
    id: "docks",
    name: "Docks",
    description:
      "You stand on a rickety dock, the dark waves splashing around you.",
    exits: new Set<LocationId>(["town-square"]),
  },
  {
    id: "town-square",
    name: "Town Square",
    description:
      "You are in the center of a quiet town square. A small fire flickers in the center, casting shadows on the dirt streets.",
    exits: new Set<LocationId>(["docks", "dungeon-entrance"]),
  },
  {
    id: "dungeon-entrance",
    name: "Dungeon Entrance",
    description:
      "You stand before a dark, foreboding entrance to a dungeon. The air is thick with the smell of damp stone and moss.",
    exits: new Set<LocationId>(["town-square", "training-ground"]),
  },
  {
    id: "training-ground",
    name: "Training Ground",
    description:
      "You are in what might generously be called a training ground. A worn out straw dummy sulks in the corner.",
    exits: new Set<LocationId>(["dungeon-entrance"]),
    creatures: new Set<CreatureInstance>([
      new CreatureInstance("trainingDummy", "training-ground"),
    ]),
  },
];

export default rawLocations;

export function addRawLocations(locations: Record<string, Location>) {
  for (const rawLocation of rawLocations) {
    locations[rawLocation.id!] = restoreFieldsAndMethods(
      rawLocation,
      new Location()
    ) as Location;
  }
}
