import { getSocket } from "./getSocketsByPlayerInstanceIds";
import locations from "./locations";
import { CreatureInstance } from "./types/creature";
import { Location, LocationId } from "./types/Location";
import { PlayerInstance } from "./types/player";
import { sendMsgToRoom, sendMsgToSocket } from "./types/socketioserverutils";
import { getFromOptionalFunc } from "./utils";

export function enterLocation(creature: CreatureInstance, location: Location) {
  console.log(
    `Creature ${creature.name} is entering location ${location.name}.`
  );

  location.creatures.add(creature);
  creature.location = location.id;

  if (creature.definitionId === "player") {
    const socket = getSocket(creature._id);
    if (!socket) {
      console.warn(
        `No socket found for player ${creature.name} (${creature._id}). Cannot enter location.`
      );
      return;
    }

    socket.join(location.id);

    sendMsgToRoom(
      location.name,
      `${creature.name} has entered ${location.name}.`
    ).then(() => {
      if (location.description) {
        sendMsgToSocket(
          socket,
          getFromOptionalFunc(location.description, creature as PlayerInstance)
        );
      }
    });
  }
}

export function exitLocation(creature: CreatureInstance, location: Location) {
  console.log(
    `Creature ${creature.name} is exiting location ${location.name}.`
  );

  location.creatures.delete(creature);

  if (creature.definitionId === "player") {
    const socket = getSocket(creature._id);
    if (!socket) {
      console.warn(
        `No socket found for player ${creature.name} (${creature._id}). Cannot exit location.`
      );
      return;
    }

    socket.leave(location.id);

    sendMsgToRoom(
      location.name,
      `${creature.name} has left ${location.name}.`
    ).then(() => sendMsgToSocket(socket, `You have left ${location.name}.`));
  }
}
