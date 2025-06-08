import { getIo } from "./ClientFriendlyIo";
import { getSocket } from "./getSocketsByPlayerInstanceIds";
import { CreatureInstance } from "./types/creature";
import { Location } from "./types/Location";
import { PlayerInstance } from "./types/player";
import {
  addMsgToSession,
  sendMsgToRoomServerOnly,
  sendMsgToSocket,
} from "./types/socketioserverutils";
import { getFromOptionalFunc } from "./utils";

export function enterLocation(creature: CreatureInstance, location: Location) {
  console.log(
    `Creature ${creature.name} is entering location ${location.name}.`
  );

  location.creatures.add(creature);
  creature.location = location.id;

  if (creature.definitionId === "player") {
    const io = getIo();
    const playerId = creature._id.toString();

    io.joinRoom(location.id, playerId);

    io.sendMsgToRoom(
      location.name,
      `${creature.name} has entered ${location.name}.`
    ).then(() => {
      if (location.description) {
        io.sendMsgToPlayer(
          playerId,
          getFromOptionalFunc(location.description, creature as PlayerInstance)
        );
      }

      io.updateGameState(playerId);
    });
  }
}

export function exitLocation(creature: CreatureInstance, location: Location) {
  console.log(
    `Creature ${creature.name} is exiting location ${location.name}.`
  );

  location.creatures.delete(creature);

  const io = getIo();

  if (creature.definitionId === "player") {
    io.leaveRoom(location.id, creature._id.toString());

    io.sendMsgToPlayer(
      creature._id.toString(),
      `You have left ${location.name}.`
    );
  }

  io.sendMsgToRoom(
    location.name,
    `${creature.name} has left ${location.name}.`
  );
}
