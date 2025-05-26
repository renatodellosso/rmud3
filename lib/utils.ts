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

export function getSingleton<T>(name: string, setter: () => T): T {
  if (!(globalThis as any).singletons) {
    (globalThis as any).singletons = {} as Record<string, any>;
  }

  const singletons = (globalThis as any).singletons as any as Record<
    string,
    any
  >;

  if (!singletons[name]) {
    singletons[name] = setter();
  }
  return singletons[name];
}

export function randInRangeInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randInRangeFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function chance(percentage: number): boolean {
  return Math.random() < percentage;
}
