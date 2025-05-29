import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../types/socketiotypes";
import registerAuthListeners from "./registerAuthListeners";
import registerGameListeners from "./registerGameListeners";
import registerSaveListeners from "./registerSaveListeners";
import { TypedServer, TypedSocket } from "lib/types/socketioserverutils";

export default function registerListeners(io: TypedServer) {
  io.on("connection", (socket) => {
    console.log("New connection!");

    registerSocketListeners(socket);
  });
}

function registerSocketListeners(socket: TypedSocket) {
  socket.on("hello", () => {
    console.log("Hello from client!");
    socket.emit("hello");
  });

  registerAuthListeners(socket);
  registerSaveListeners(socket);
  registerGameListeners(socket);
}
