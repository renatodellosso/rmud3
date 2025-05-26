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
import { EJSON, ObjectId } from "bson";
import CollectionId from "./types/CollectionId";
import { PlayerSave } from "./types/types";
import { PlayerInstance, PlayerProgress } from "lib/types/player";
import { getSingleton } from "./utils";
import generateDungeon from "./dungeongeneration/generateDungeon";

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

  socket.on("getSaves", async (callback) => {
    if (!socket.data.session) {
      console.error("No session set for socket");
      callback(EJSON.stringify([]));
      return;
    }

    const db = await getMongoClient();
    const collectionManager = getCollectionManager(db);

    const accounts = await collectionManager
      .getCollection(CollectionId.Accounts)
      .findWithOneFilter({
        _id: socket.data.session.accountId,
      });

    if (!accounts || accounts.length === 0) {
      console.error("No account found for session:", socket.data.session._id);
      callback(EJSON.stringify([]));
      return;
    }

    const account = accounts[0];

    const progresses = await collectionManager
      .getCollection(CollectionId.PlayerProgresses)
      .find(
        {
          _id: { $in: account.playerProgresses },
        },
        undefined
      );

    const instances = await collectionManager
      .getCollection(CollectionId.PlayerInstances)
      .find(
        {
          _id: { $in: progresses.map((progress) => progress._id) },
        },
        undefined
      );

    const saves = progresses
      .map((progress) => {
        const instance = instances.find(
          (instance) => instance._id.toString() === progress._id.toString()
        );

        if (!instance) {
          console.error("No instance found for progress:", progress._id);
          return undefined;
        }

        return {
          instance,
          progress,
        };
      })
      .filter((save: PlayerSave | undefined) => save !== undefined);

    callback(EJSON.stringify(saves));
  });

  socket.on("createNewSave", async () => {
    if (!socket.data.session) {
      console.error("No session set for socket");
      return;
    }

    const db = await getMongoClient();
    const collectionManager = getCollectionManager(db);

    const accountsCollection = await collectionManager.getCollection(
      CollectionId.Accounts
    );

    const accounts = await accountsCollection.findWithOneFilter({
      _id: socket.data.session.accountId,
    });

    if (!accounts || accounts.length === 0) {
      console.error("No account found for session:", socket.data.session._id);
      return;
    }

    const progressesCollection = await collectionManager.getCollection(
      CollectionId.PlayerProgresses
    );

    const instancesCollection = await collectionManager.getCollection(
      CollectionId.PlayerInstances
    );

    const instance: PlayerInstance = new PlayerInstance();

    instance._id = new ObjectId();

    const progress: PlayerProgress = {
      _id: new ObjectId(),
      playerInstanceId: instance._id,
    };

    instancesCollection.upsert(instance);
    progressesCollection.upsert(progress);

    const account = accounts[0];

    account.playerProgresses.push(progress._id);

    accountsCollection.upsert(account);
  });
}
