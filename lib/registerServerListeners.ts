import { Server, Socket } from "socket.io";
import { createAccount, signIn } from "./auth";
import getCollectionManager from "./getCollectionManager";
import getSessionManager from "./SessionManager";
import { getMongoClient } from "./getMongoClient";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./types/socketiotypes";
import { ObjectId } from "bson";

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
      console.log("Sign in successful! User:", email, "Session ID:", sessionId);
      callback(sessionId.toString());
    } else {
      console.log("Sign in failed! User:", email);
      callback(undefined);
    }
  });

  socket.on("signUp", async (email, username, password, callback) => {
    const db = await getMongoClient();
    const collectionManager = getCollectionManager(db);

    const accountOrError = await createAccount(
      collectionManager,
      email,
      username,
      password
    );

    if (typeof accountOrError === "string") {
      console.log("Sign up failed! User:", email, "Error:", accountOrError);
      callback(undefined, accountOrError);
      return;
    }

    const sessionManager = getSessionManager();

    const session = sessionManager.createSession(accountOrError._id);

    console.log("Sign up successful! User:", email, "Session ID:", session._id);
    socket.data.sessionId = session._id;
    callback(session._id.toString(), undefined);
  });

  socket.on("setSessionId", (sessionId, callback) => {
    if (!sessionId) {
      console.error("No session ID provided");
      callback(false);
      return;
    }

    const sessionManager = getSessionManager();
    const session = sessionManager.getSession(new ObjectId(sessionId));

    if (!session) {
      console.error("Invalid session ID:", sessionId);
      callback(false);
      return;
    }

    socket.data.sessionId = session._id;
    callback(true);
  });
}
