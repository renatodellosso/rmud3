import { ObjectId } from "bson";

type Account = {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  playerProgresses: ObjectId[];
};

export default Account;
