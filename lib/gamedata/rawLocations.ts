import { OmitType } from "lib/types/types";
import { Location } from "../types/Location";
import { restoreFieldsAndMethods } from "lib/utils";
import { CreatureInstance } from "lib/types/entities/creature";
import { EntityInstance } from "lib/types/entity";

export type LocationId =
  | "docks"
  | "town-square"
  | "dungeon-entrance"
  | "training-ground"
  | "tavern"
  | "bank"
  | `dungeon-${string}`;

const rawLocations: Partial<OmitType<Location, Function>>[] = [
  {
    id: "docks",
    name: "Docks",
    description:
      "You stand on a rickety dock, the dark waves splashing around you.",
    exits: new Set<LocationId>(["town-square"]),
    entities: new Set<EntityInstance>([
      new EntityInstance("signPost", "docks"),
    ]),
  },
  {
    id: "town-square",
    name: "Town Square",
    description:
      "You are in the center of a quiet town square. A small fire flickers in the center, casting shadows on the dirt streets.",
    exits: new Set<LocationId>(["docks", "dungeon-entrance", "tavern", "bank"]),
    entities: new Set<EntityInstance>([
      new EntityInstance("anvil", "town-square"),
      new EntityInstance("mystic", "town-square"),
    ]),
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
    entities: new Set<EntityInstance>([
      new CreatureInstance("trainingDummy", "training-ground"),
    ]),
  },
  {
    id: "tavern",
    name: "Tavern",
    description:
      "You are in a slightly-leaky tavern, the smell of ale and roasted meat filling the air. A warm fire crackles in the corner.",
    exits: new Set<LocationId>(["town-square"]),
    entities: new Set<EntityInstance>([
      new EntityInstance("tavernKeeper", "tavern"),
      new EntityInstance("junkCollector", "tavern"),
    ]),
  },
  {
    id: "bank",
    name: "Bank",
    description:
      "You are in a small, dusty bank. The walls are lined with shelves of old books and scrolls.",
    exits: new Set<LocationId>(["town-square"]),
    entities: new Set<EntityInstance>([
      new EntityInstance("banker", "bank"),
      new EntityInstance("vault", "bank"),
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
