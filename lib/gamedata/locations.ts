import { restoreFieldsAndMethods } from "lib/utils";
import { Location, LocationId } from "../types/Location";
import { OmitType } from "lib/types/types";

const rawLocations: Partial<OmitType<Location, Function>>[] = [
  {
    id: "docks",
    name: "Docks",
    description:
      "You stand on a rickety dock, the dark waves splashing around you.",
    exits: new Set(["townSquare"]),
  },
  {
    id: "townSquare",
    name: "Town Square",
    description:
      "You are in the center of a quiet town square. A small fire flickers in the center, casting shadows on the dirt streets.",
  },
];

const locations: Record<string, Location> = rawLocations.reduce(
  (
    acc: Record<LocationId, Location>,
    loc: Partial<OmitType<Location, Function>>
  ) => {
    if (!loc.id) {
      console.warn("Location without id found:", loc);
      return acc;
    }
    acc[loc.id] = restoreFieldsAndMethods(loc, new Location()) as Location;
    return acc;
  },
  {} as Record<string, Location>
);

export default locations;
