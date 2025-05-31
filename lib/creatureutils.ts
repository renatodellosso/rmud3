import locations from "./locations";
import { enterLocation, exitLocation } from "./locationutils";
import { savePlayer } from "./PlayerManager";
import Ability, { AbilitySource } from "./types/Ability";
import { CreatureInstance } from "./types/creature";
import { LocationId } from "./types/Location";
import { PlayerInstance } from "./types/player";
import {
  sendMsgToRoom,
  updateGameStateForRoom,
} from "./types/socketioserverutils";
import { Targetable } from "./types/types";
import { getFromOptionalFunc } from "./utils";

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

export function activateAbility(
  ability: Ability,
  creature: CreatureInstance,
  targets: Targetable[],
  source: AbilitySource
) {
  const msg = ability.activate(creature, targets, source);

  const location = locations[creature.location];

  creature.lastActedAt = new Date();
  creature.canActAt = new Date();

  creature.canActAt.setSeconds(
    creature.canActAt.getSeconds() +
      getFromOptionalFunc(ability.getCooldown, creature, source)
  );

  sendMsgToRoom(location.id, msg);
  updateGameStateForRoom(location.id);
}
