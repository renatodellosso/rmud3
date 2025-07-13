import { ObjectId } from "bson";
import { restoreFieldsAndMethods } from "lib/utils";
import CollectionId from "./CollectionId";
import { PlayerInstance } from "./entities/player";
import Inventory, { DirectInventory } from "./Inventory";

export default class Guild {
  _id: ObjectId = new ObjectId();

  name: string = "Unnamed Guild";

  owner: ObjectId | undefined;
  members: ObjectId[];

  level: number = 0;
  xp: number = 0;

  storage: DirectInventory = new DirectInventory();

  constructor(owner: ObjectId | undefined, members: ObjectId[] = []) {
    this.owner = owner;
    this.members = members;

    this.storage.maxWeight = this.getPerks().guildStorageCapacity;
  }

  static async fromId(id: ObjectId): Promise<Guild | undefined> {
    if (!id) {
      return undefined;
    }

    if (typeof window === "undefined") {
      const func = require("../getCollectionManager").default;
      const collectionManager = func();
      const guildCollection = collectionManager.getCollection(
        CollectionId.Guilds
      );

      const guildData = await guildCollection.get(id);

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

  addXp(amount: number) {
    this.xp += amount;

    // Check if the guild can level up
    const xpForNextLevel = xpForNextGuildLevel(this.level);
    while (this.xp >= xpForNextLevel) {
      this.level++;

      this.storage.maxWeight = this.getPerks().guildStorageCapacity;
    }

    Guild.upsert(this);
  }

  getPerks(): GuildPerks {
    return getGuildPerksByLevel(this.level);
  }
}

export type GuildMember = PlayerInstance & {
  isOnline: boolean;
  isOwner: boolean;
};

export type ClientGuild = Guild & {
  memberInstances: GuildMember[];
};

export function xpForNextGuildLevel(level: number): number {
  return Math.round(Math.pow(2.5, level) * 10000);
}

export type GuildPerks = {
  baseAbilityScoreBonusMultiplier: number;
  xpGainBonusMultiplier: number;
  shopDiscount: number;
  guildStorageCapacity: number;
};

const perksByLevel: Partial<GuildPerks>[] = [
  {
    xpGainBonusMultiplier: 0.1,
    guildStorageCapacity: 100,
  },
  {
    baseAbilityScoreBonusMultiplier: 0.1,
  },
  {
    shopDiscount: 0.1,
    guildStorageCapacity: 250,
  },
  {
    xpGainBonusMultiplier: 0.2,
  },
  {
    baseAbilityScoreBonusMultiplier: 0.2,
    guildStorageCapacity: 500,
  },
  {
    shopDiscount: 0.2,
  },
  {
    xpGainBonusMultiplier: 0.3,
    guildStorageCapacity: 1000,
  },
  {
    baseAbilityScoreBonusMultiplier: 0.3,
  },
  {
    shopDiscount: 0.3,
    guildStorageCapacity: 2000,
  },
];

export function getGuildPerksByLevel(level: number): GuildPerks {
  const perks: GuildPerks = {
    baseAbilityScoreBonusMultiplier: 0,
    xpGainBonusMultiplier: 0,
    shopDiscount: 0,
    guildStorageCapacity: 0,
  };

  for (let i = 0; i < level && i < perksByLevel.length; i++) {
    const perk = perksByLevel[i];
    for (const key in perk) {
      if (perk.hasOwnProperty(key)) {
        const value = perk[key as keyof GuildPerks];
        if (value !== undefined) {
          (perks[key as keyof GuildPerks] as number) = value;
        }
      }
    }
  }

  return perks;
}
