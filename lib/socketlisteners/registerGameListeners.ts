import { LocationId } from "lib/types/Location";
import {
  getPlayer,
  TypedSocket,
  updateGameState,
} from "lib/types/socketioserverutils";

export default function registerGameListeners(socket: TypedSocket) {
  socket.on("requestGameState", () => {
    updateGameState(socket);
  });

  socket.on("move", (exitId: LocationId) => {
    const player = getPlayer(socket);

    
  });
}
