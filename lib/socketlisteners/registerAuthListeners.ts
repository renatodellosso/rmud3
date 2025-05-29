import { signIn, createAccount } from "lib/auth";
import getCollectionManager from "lib/getCollectionManager";
import { getMongoClient } from "lib/getMongoClient";
import getSessionManager from "lib/SessionManager";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "lib/types/socketiotypes";
import { PlayerSave } from "lib/types/types";
import { EJSON, ObjectId } from "bson";
import { Socket } from "socket.io";
import getSocketsByPlayerInstanceIds from "lib/getSocketsByPlayerInstanceIds";

export default function registerAuthListeners(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  socket.on("signIn", async (email, password, callback) => {
    const db = await getMongoClient();

    const sessionId = await signIn(
      getCollectionManager(db)!,
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
    socket.data.session = session;
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

    socket.data.session = session;

    callback(true);
  });
}
