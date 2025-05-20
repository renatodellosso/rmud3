import { ItemInstance } from "./types";

/**
 * Copies all properties from the prototype to the object if they are not already defined.
 */
export function restoreFieldsAndMethods<T extends object>(
  obj: T,
  prototype: T
) {
  for (const key in prototype) {
    if (
      !(key in obj) ||
      (obj[key] === undefined && prototype[key] !== undefined)
    ) {
      const method = prototype[key];
      obj[key] = method;
    }
  }
}

/**
 * @param [skipAmount=true] If true, the amount property will be ignored when comparing the two item instances.
 * @returns true if the two item instances are equal, false otherwise.
 */
export function areItemInstancesEqual(
  item1: ItemInstance,
  item2: ItemInstance,
  skipAmount = true
) {
  if (item1 == item2)
    return true;

  for (const key in item1) {
    if (skipAmount && key === "amount") continue;
    if (
      (item1 as Record<string, any>)[key] !==
      (item2 as Record<string, any>)[key]
    )
      return false;
  }

  return true;
}
