import { ObjectId } from "bson";
import { Interaction } from "./entity";
import LocationMap from "./LocationMap";

type Session = {
  _id: ObjectId;
  accountId: ObjectId;
  playerProgressId: ObjectId | undefined;
  playerInstanceId: ObjectId | undefined;
  messages: string[];
  interactions: Interaction[];
  map: LocationMap;
};

export default Session;
