import { restoreFieldsAndMethods } from "lib/utils";
import { Location } from "../types/Location";

const locations = {
  docks: restoreFieldsAndMethods(
    {
      name: "Docks",
    },
    new Location()
  ),
} as Record<string, Location>;

export default locations;
