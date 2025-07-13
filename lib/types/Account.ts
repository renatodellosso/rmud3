import { ObjectId } from "bson";

type Account = {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  playerProgresses: ObjectId[];
  discordLinkCode: string;
  discordUserId?: string;
  primarySaveId?: ObjectId;
};

export default Account;

export function getRandomDiscordLinkCode(): string {
  return Math.random().toString(36).substring(2, 10);
}
