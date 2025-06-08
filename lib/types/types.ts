import { CreatureInstance } from "./creature";
import { Location, LocationId } from "./Location";
import { restoreFieldsAndMethods } from "../utils";
import { PlayerInstance, PlayerProgress } from "./player";

export type Targetable = CreatureInstance | Location;

export class CannotDirectlyCreateInstanceError extends Error {
  constructor(className: string) {
    super(
      `Cannot create an instance of ${className} directly. Create it like an instance of a type and then call ${restoreFieldsAndMethods.name}`
    );
    this.name = "CannotDirectlyCreateInstanceError";
  }
}

export enum AbilityScore {
  Strength = "Strength",
  Constitution = "Constitution",
  Intelligence = "Intelligence",
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
  location: OmitType<Omit<Location, "creatures" | "exits">, Function> & {
    creatures: CreatureInstance[];
    exits: ExitData[];
  };
  messages: string[];
};

export enum DamageType {
  Slashing = "Slashing",
  Piercing = "Piercing",
  Bludgeoning = "Bludgeoning",
}
