import { getSingleton } from "./utils";
import { ObjectId } from "bson";
import { TypedSocket } from "./types/socketioserverutils";

const getSocketsByPlayerInstanceIds = () =>
  getSingleton(
    "socketsByPlayerInstanceIds",
    () => new Map<string, TypedSocket>()
  );

export default getSocketsByPlayerInstanceIds;

export function getSocket(instanceId: ObjectId) {
  return getSocketsByPlayerInstanceIds()?.get(instanceId.toString());
}

export function setSocket(instanceId: ObjectId, socket: TypedSocket) {
  getSocketsByPlayerInstanceIds()?.set(instanceId.toString(), socket);
}
