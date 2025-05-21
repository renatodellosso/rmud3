import { ItemInstance } from "./types/item";

/**
 * Copies all properties from the prototype to the object if they are not already defined.
 */
export function restoreFieldsAndMethods<T extends object>(
  obj: T,
  prototype: T
) {
  const keys = Object.getOwnPropertyNames(prototype);

  // Cast to Record<string, any> to avoid TypeScript errors
  const rObj = obj as Record<string, any>;
  const rPrototype = prototype as Record<string, any>;

  for (const key of keys) {
    if (
      (!(key in obj) && key in prototype) ||
      (rObj[key] === undefined && rPrototype[key] !== undefined)
    ) {
      rObj[key] = rPrototype[key];
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
  if (item1 == item2) return true;

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
