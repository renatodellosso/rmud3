import { ObjectId } from "bson";

type Session = {
  _id: ObjectId;
  accountId: ObjectId;
  playerProgressId: ObjectId | undefined;
  playerInstanceId: ObjectId | undefined;
};

export default Session;
