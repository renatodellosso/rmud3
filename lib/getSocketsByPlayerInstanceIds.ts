import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socketiotypes";
import { getSingleton } from "./utils";
import { ObjectId } from "bson";

const getSocketsByPlayerInstanceIds = () =>
  getSingleton(
    "socketsByPlayerInstanceIds",
    () =>
      new Map<
        string,
        Socket<
          ServerToClientEvents,
          ClientToServerEvents,
          InterServerEvents,
          SocketData
        >
      >()
  );

export default getSocketsByPlayerInstanceIds;

export function getSocket(instanceId: ObjectId) {
  return getSocketsByPlayerInstanceIds()?.get(instanceId.toString());
}

export function setSocket(
  instanceId: ObjectId,
  socket: Socket<
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
  >
) {
  getSocketsByPlayerInstanceIds()?.set(instanceId.toString(), socket);
}
