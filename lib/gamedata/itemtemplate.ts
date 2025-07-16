import { ConsumableDefinition, ItemDefinition } from "lib/types/item";
import { ItemTag } from "lib/types/itemenums";
import * as CanTarget from "lib/gamedata/CanTarget";
import { FloorInstance } from "lib/dungeongeneration/types";
import { Location } from "lib/types/Location";
import locations from "lib/locations";
import { randInRangeInt } from "lib/utils";
import { getIo } from "lib/ClientFriendlyIo";

export function teleportScroll(depth: number): ConsumableDefinition {
  const displayDepth = depth + 1;
  return {
    getName: `Teleport Scroll (Depth ${displayDepth})`,
    tags: [ItemTag.Consumable],
    description: `A scroll that teleports you to a random room at depth ${displayDepth}.`,
    getWeight: 0.1,
    getSellValue: 25 * depth,
    getAbilities: [
      {
        name: `Teleport to Depth ${displayDepth}`,
        getDescription: `Teleport to a random room at depth ${displayDepth}.`,
        getCooldown: 5,
        getTargetCount: 1,
        canTarget: CanTarget.isSelf,
        activate: (creature, targets) => {
          const target = targets[0];
          if (!target) return false;

          const possibleLocations: Location[] = [];
          for (const location of Object.values(locations)) {
            if (
              "floor" in location &&
              (location.floor as FloorInstance).depth === depth
            ) {
              possibleLocations.push(location);
            }
          }

          if (possibleLocations.length === 0) return false;

          const randomLocation =
            possibleLocations[randInRangeInt(0, possibleLocations.length - 1)];

          locations[creature.location].exit(creature);
          randomLocation.enter(creature);

          getIo().sendMsgToPlayer(
            creature._id.toString(),
            `You teleport to a random room at depth ${displayDepth}.`
          );

          return true;
        },
      },
    ],
  };
}
