//Use this file to get around circular dependencies

import { restoreFieldsAndMethods } from "./utils";

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
