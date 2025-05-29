import locations from "lib/gamedata/locations";
import getPlayerManager from "lib/PlayerManager";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "lib/types/socketiotypes";
import { GameState } from "lib/types/types";
import { Socket } from "socket.io";
import { EJSON } from "bson";

export default function registerGameListeners(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  socket.on("requestGameState", () => {
    const playerManager = getPlayerManager();

    if (
      !socket.data.session?.playerInstanceId ||
      !socket.data.session?.playerProgressId
    ) {
      console.error(
        "Player instance or progress ID not found in session data."
      );
      return;
    }

    const player = playerManager.getPlayerByInstanceId(
      socket.data.session!.playerInstanceId
    );

    if (!player) {
      console.error(
        "Player not found when requesting game state. Player ID:",
        socket.data.session?.playerInstanceId
      );
      return;
    }

    const location = locations[player.instance.location];

    const gameState: GameState = {
      self: player.instance,
      progress: player.progress,
      location,
    };

    socket.emit("setGameState", EJSON.stringify(gameState));
  });
}
