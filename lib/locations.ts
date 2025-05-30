import { getSingleton } from "./utils";
import { Location } from "./types/Location";

const locations = getSingleton(
  "locations",
  () => ({} as Record<string, Location>)
)!;

export default locations;
