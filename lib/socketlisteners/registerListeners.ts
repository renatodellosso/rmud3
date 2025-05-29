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

export default function registerListeners(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  io.on("connection", (socket) => {
    console.log("New connection!");

    registerSocketListeners(socket);
  });
}

function registerSocketListeners(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  socket.on("hello", () => {
    console.log("Hello from client!");
    socket.emit("hello");
  });

  registerAuthListeners(socket);
  registerSaveListeners(socket);
  registerGameListeners(socket);
}
