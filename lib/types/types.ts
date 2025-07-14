import { Location } from "./Location";
import { randInRangeInt, restoreFieldsAndMethods } from "../utils";
import { PlayerInstance, PlayerProgress } from "./entities/player";
import { EntityInstance, Interaction } from "./entity";
import { LocationId } from "lib/gamedata/rawLocations";
import LocationMap from "./LocationMap";
import items, { ItemId } from "lib/gamedata/items";
import { ItemDefinition, ItemInstance } from "./item";
import Guild, { ClientGuild } from "./Guild";
import { DamageType } from "./Damage";
import { ObjectId } from "bson";

export type Targetable = EntityInstance | Location;

export class CannotDirectlyCreateInstanceError extends Error {
  constructor(className: string) {
    super(
      `Cannot create an instance of ${className} directly. Create it like an instance of a type and then call ${restoreFieldsAndMethods.name}`
    );
    this.name = "CannotDirectlyCreateInstanceError";
  }
}

/**
 * Allows for either a value or a function that returns a value of the same type.
 * Ex: string | ((...params: any[]) => string)
 */
export type OptionalFunc<TReturn, TParams extends any> =
  | TReturn
  | ((...params: TParams extends any[] ? TParams : [TParams]) => TReturn);

type FlagExcludedType<Base, Type> = {
  [Key in keyof Base]: Base[Key] extends Type ? never : Key;
};

type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];

export type OmitType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;

export type SerializedEJSON<T> = string;

export type PlayerSave = {
  instance: PlayerInstance;
  progress: PlayerProgress;
};

export type Point = [number, number];
export type Range = [number, number];

export type ExitData = {
  name: string;
  id: LocationId;
};

export type GameState = {
  self: PlayerInstance;
  progress: PlayerProgress;
  location: OmitType<Omit<Location, "entities" | "exits">, Function> & {
    entities: (EntityInstance & { interactable: boolean })[];
    exits: ExitData[];
  };
  messages: string[];
  chatMessages: { user: string; message: string }[];
  interactions: Interaction[];
  map: LocationMap;
  guild: ClientGuild | undefined;
  minutesTillDungeonRegeneration: number;
};

export type DamageWithType = {
  amount: number;
  type: DamageType;
};

export type BuyOrder = {
  _id: ObjectId;
  /**
   * Player instance that created the buy order.
   */
  owner: ObjectId;
  ownerDiscordId: string;
  itemId: ItemId;
  amount: number;
  price: number;
};
