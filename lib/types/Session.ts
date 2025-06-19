import { ObjectId } from "bson";
import { Interaction } from "./entity";

type Session = {
  _id: ObjectId;
  accountId: ObjectId;
  playerProgressId: ObjectId | undefined;
  playerInstanceId: ObjectId | undefined;
  messages: string[];
  interactions: Interaction[];
};

export default Session;
