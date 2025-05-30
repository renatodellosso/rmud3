import locations from "./locations";
import { enterLocation, exitLocation } from "./locationutils";
import { savePlayer } from "./PlayerManager";
import { CreatureInstance } from "./types/creature";
import { LocationId } from "./types/Location";
import { PlayerInstance } from "./types/player";

export function moveCreature(
  creature: CreatureInstance,
  newLocationId: LocationId
) {
  if (!locations[newLocationId]) {
    throw new Error(`Invalid location ID: ${newLocationId}`);
  }

  const currentLocation = locations[creature.location];
  if (!currentLocation.exits.has(newLocationId)) {
    throw new Error(
      `Cannot move to ${newLocationId} from ${creature.location}. No exit available.`
    );
  }

  exitLocation(creature, currentLocation);
  const newLocation = locations[newLocationId];
  enterLocation(creature, newLocation);

  if (creature.definitionId === "player") {
    savePlayer(creature as PlayerInstance);
  }

  console.log(
    `Creature ${creature.name} moved from ${currentLocation.name} to ${creature.location}.`
  );
}
