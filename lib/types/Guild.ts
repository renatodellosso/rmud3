import { ObjectId } from "bson";
import { restoreFieldsAndMethods } from "lib/utils";
import CollectionId from "./CollectionId";

export default class Guild {
  _id: ObjectId = new ObjectId();

  name: string = "Unnamed Guild";

  owner: ObjectId | undefined;
  members: ObjectId[];

  constructor(owner: ObjectId | undefined, members: ObjectId[] = []) {
    this.owner = owner;
    this.members = members;
  }

  static fromId(id: ObjectId): Guild | undefined {
    if (!id) {
      return undefined;
    }

    if (typeof window === "undefined") {
      const func = require("../getCollectionManager").default;
      const collectionManager = func();
      const guildCollection = collectionManager.getCollection(
        CollectionId.Guilds
      );

      const guildData = guildCollection.get(id);

      if (!guildData) {
        return undefined;
      }

      return restoreFieldsAndMethods(
        guildData,
        new Guild(guildData.owner, guildData.members)
      );
    }
    return undefined;
  }

  static upsert(guild: Guild) {
    if (typeof window === "undefined") {
      const func = require("../getCollectionManager").default;
      console.log(func);
      const collectionManager = func();
      const guildCollection = collectionManager.getCollection(
        CollectionId.Guilds
      );

      guildCollection.upsert(guild);
    }
    return undefined;
  }
}
