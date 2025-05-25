import { Server, Socket } from "socket.io";
import { signIn } from "./auth";
import getCollectionManager from "./getCollectionManager";
import getSessionManager from "./SessionManager";
import { getMongoClient } from "./getMongoClient";

export default function registerServerListeners(
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

  socket.on("signIn", async (email, password, callback) => {
    const db = await getMongoClient();

    const sessionId = await signIn(
      getCollectionManager(db),
      getSessionManager(),
      email,
      password
    );

    if (sessionId) {
      console.log("Sign in successful! User:", email);
      callback(sessionId.toString());
    } else {
      console.log("Sign in failed! User:", email);
      callback(undefined);
    }
  });
}
