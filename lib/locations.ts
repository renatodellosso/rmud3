import { getSingleton } from "./utils";
import { Location, LocationId } from "./types/Location";

const locations = getSingleton(
  "locations",
  () => ({} as Record<LocationId, Location>)
)!;

export default locations;
