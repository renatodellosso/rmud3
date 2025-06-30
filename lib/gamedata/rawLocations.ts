import { OmitType } from "lib/types/types";
import { Location } from "../types/Location";
import { restoreFieldsAndMethods } from "lib/utils";
import { CreatureInstance } from "lib/types/entities/creature";
import { EntityInstance } from "lib/types/entity";

// Be sure to update location map if you add a new location!

export type LocationId =
  | "docks"
  | "town-square"
  | "dungeon-entrance"
  | "training-ground"
  | "tavern"
  | "north-road-1"
  | "north-road-2"
  | "bank"
  | "workshop"
  | "clearing"
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
    exits: new Set<LocationId>([
      "docks",
      "dungeon-entrance",
      "tavern",
      "north-road-1",
    ]),
    entities: new Set<EntityInstance>([
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
    exits: new Set<LocationId>(["north-road-1"]),
    entities: new Set<EntityInstance>([
      new EntityInstance("banker", "bank"),
      new EntityInstance("vault", "bank"),
    ]),
  },
  {
    id: "north-road-1",
    name: "North Road",
    description:
      "You are on a long, winding road that leads north. The path is lined with trees and bushes.",
    exits: new Set<LocationId>(["town-square", "bank", "north-road-2"]),
  },
  {
    id: "north-road-2",
    name: "North Road",
    description:
      "You are on a long, winding road that leads north. The path is lined with trees and bushes.",
    exits: new Set<LocationId>(["north-road-1", "workshop", "clearing"]),
  },
  {
    id: "workshop",
    name: "Workshop",
    description:
      "You are in a small workshop filled with tools and materials. The walls are lined with shelves of various items.",
    exits: new Set<LocationId>(["north-road-2"]),
    entities: new Set<EntityInstance>([
      new EntityInstance("anvil", "workshop"),
      new EntityInstance("furnace", "workshop"),
      new EntityInstance("workbench", "workshop"),
      new EntityInstance("reforgeAnvil", "workshop"),
    ]),
  },
  {
    id: "clearing",
    name: "Clearing",
    description:
      "You are in a small clearing in the woods. The moon shines down through the trees, and you can hear owls in the distance.",
    exits: new Set<LocationId>(["north-road-2"]),
    entities: new Set<EntityInstance>([
      new EntityInstance("menhir", "clearing"),
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
