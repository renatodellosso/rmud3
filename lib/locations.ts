import { getSingleton } from "./utils";
import { Location } from "./types/Location";
import { LocationId } from "./gamedata/rawLocations";

const locations = getSingleton(
  "locations",
  () => ({} as Record<LocationId, Location>)
)!;

export default locations;
