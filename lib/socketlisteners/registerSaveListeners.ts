import locations from "lib/locations";
import getPlayerManager, { spawnPlayer } from "lib/PlayerManager";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "lib/types/socketiotypes";
import { GameState, PlayerSave } from "lib/types/types";
import { Socket } from "socket.io";
import { EJSON, ObjectId } from "bson";
import getCollectionManager from "lib/getCollectionManager";
import { getMongoClient } from "lib/getMongoClient";
import CollectionId from "lib/types/CollectionId";
import {
  getDefaultPlayerAndProgress,
  PlayerInstance,
  PlayerProgress,
} from "lib/types/entities/player";
import { setSocket } from "lib/getSocketsByPlayerInstanceIds";
import { TypedSocket } from "lib/types/socketioserverutils";
import { savePlayer } from "lib/utils";
import LocationMap from "lib/types/LocationMap";

function startPlaySession(
  socket: TypedSocket,
  instance: PlayerInstance,
  progress: PlayerProgress
) {
  socket.data.session!.playerInstanceId = instance._id;
  socket.data.session!.playerProgressId = progress._id;
  socket.data.session!.map = new LocationMap();

  setSocket(instance._id, socket);

  const playerManager = getPlayerManager();
  spawnPlayer(playerManager, instance, progress);
}

export default function registerSaveListeners(socket: TypedSocket) {
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
          _id: { $in: progresses.map((progress) => progress.playerInstanceId) },
        },
        undefined
      );

    const saves = progresses
      .map((progress) => {
        const instance = instances.find((instance) =>
          instance._id.equals(progress.playerInstanceId)
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

  socket.on("createNewSave", async (saveName, difficulty) => {
    if (!socket.data.session) {
      console.error("No session set for socket");
      return;
    }

    const db = await getMongoClient();
    const collectionManager = getCollectionManager(db);

    const accountsCollection = collectionManager.getCollection(
      CollectionId.Accounts
    );

    const accounts = await accountsCollection.findWithOneFilter({
      _id: socket.data.session.accountId,
    });

    if (!accounts || accounts.length === 0) {
      console.error("No account found for session:", socket.data.session._id);
      return;
    }

    const account = accounts[0];

    const progressesCollection = collectionManager.getCollection(
      CollectionId.PlayerProgresses
    );

    const instancesCollection = collectionManager.getCollection(
      CollectionId.PlayerInstances
    );

    const { instance, progress } = getDefaultPlayerAndProgress(difficulty);
    instance.name = account!.username;
    instance.saveName = saveName;

    instancesCollection.upsert(instance);
    progressesCollection.upsert(progress);

    account.playerProgresses.push(progress._id);

    accountsCollection.upsert(account);

    startPlaySession(socket, instance, progress);
  });

  socket.on("selectSave", async (strProgressId: string) => {
    const progressId = new ObjectId(strProgressId);

    const db = await getMongoClient();
    const collectionManager = getCollectionManager(db);

    const accountsCollection = collectionManager.getCollection(
      CollectionId.Accounts
    );

    const account = (
      await accountsCollection.findWithOneFilter({
        _id: socket.data.session?.accountId,
      })
    )[0];

    if (!account) {
      console.error("No account found for session:", socket.data.session?._id);
      return;
    }

    if (!account.playerProgresses.find((p) => p.equals(progressId))) {
      console.error(
        `Progress ID ${progressId} not found in account's player progresses.`
      );
      return;
    }

    const progressesCollection = collectionManager.getCollection(
      CollectionId.PlayerProgresses
    );
    const progress = (
      await progressesCollection.findWithOneFilter({
        _id: progressId,
      })
    )[0];

    if (!progress) {
      console.error(`No progress found for ID: ${progressId}`);
      return;
    }

    const instancesCollection = collectionManager.getCollection(
      CollectionId.PlayerInstances
    );

    const instance = (
      await instancesCollection.findWithOneFilter({
        _id: progress.playerInstanceId,
      })
    )[0];

    if (!instance) {
      console.error(
        `No instance found for player instance ID: ${progress.playerInstanceId}`
      );
      return;
    }

    startPlaySession(socket, instance, progress);
  });

  socket.on("disconnect", () => {
    if (!socket.data.session || !socket.data.session.playerInstanceId) {
      return;
    }

    const playerManager = getPlayerManager();
    const player = playerManager.getPlayerByInstanceId(
      socket.data.session.playerInstanceId!
    );

    console.log(`Player ${player?.instance.name} disconnected. Saving...`);
    savePlayer(player!.instance);
  });
}
