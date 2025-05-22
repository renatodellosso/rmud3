import { ItemInstance } from "./types/item";

/**
 * Copies all properties from the prototype to the object if they are not already defined.
 */
export function restoreFieldsAndMethods<T extends object>(obj: T, template: T) {
  if (!template) return;

  const prototype = Object.getPrototypeOf(template);
  const keys = Object.getOwnPropertyNames(template).concat(
    prototype ? Object.getOwnPropertyNames(prototype) : []
  );

  // Cast to Record<string, any> to avoid TypeScript errors
  const rObj = obj as Record<string, any>;
  const rPrototype = template as Record<string, any>;

  if (prototype) {
    for (const key of keys) {
      rPrototype[key] ??= prototype[key];
    }
  }

  for (const key of keys) {
    if (
      (!(key in obj) && key in template) ||
      (rObj[key] === undefined && rPrototype[key] !== undefined)
    ) {
      rObj[key] = rPrototype[key];
    } else if (
      typeof rObj[key] === "object" &&
      typeof rPrototype[key] === "object"
    ) {
      // If the property is an object, recursively restore fields and methods
      restoreFieldsAndMethods(rObj[key], rPrototype[key]);
    } else if (Array.isArray(rObj[key]) && Array.isArray(rPrototype[key])) {
      // If the property is an array, recursively restore fields and methods for each element
      for (let i = 0; i < rObj[key].length; i++) {
        if (rPrototype[key][i]) {
          restoreFieldsAndMethods(rObj[key][i], rPrototype[key][i]);
        }
      }
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
