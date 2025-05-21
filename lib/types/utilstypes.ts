//Use this file to get around circular dependencies

import { restoreFieldsAndMethods } from "../utils";

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
