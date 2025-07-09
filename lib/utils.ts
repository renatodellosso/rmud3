import { ItemInstance } from "./types/item";
import { PlayerInstance } from "./types/entities/player";
import { OptionalFunc, Targetable } from "./types/types";
import { ObjectId } from "bson";
import { LocationId } from "./gamedata/rawLocations";

/**
 * Copies all properties from the prototype to the object if they are not already defined.
 */
export function restoreFieldsAndMethods<T extends object>(
  obj: Partial<T>,
  template: T
): T {
  if (!template) return obj as T;

  const prototype = Object.getPrototypeOf(template);
  const keySet = new Set(
    Object.getOwnPropertyNames(template).concat(
      prototype ? Object.getOwnPropertyNames(prototype) : []
    )
  );

  let superPrototype = Object.getPrototypeOf(prototype);
  while (superPrototype && superPrototype !== Object.prototype) {
    Object.getOwnPropertyNames(superPrototype).forEach((name) =>
      keySet.add(name)
    );
    superPrototype = Object.getPrototypeOf(superPrototype);
  }

  const keys = Array.from(keySet);

  // Cast to Record<string, any> to avoid TypeScript errors
  const rObj = obj as Record<string, any>;
  const rPrototype = template as Record<string, any>;

  if (prototype) {
    for (const key of keys) {
      rPrototype[key] ??= prototype[key];
    }
  }

  for (const key of keys) {
    try {
      if (key === "__proto__") continue;

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
    } catch (e) {
      throw new Error(`Error restoring key "${key}": ${e}`);
    }
  }

  return obj as T;
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

  const keys = Array.from(
    new Set([...Object.keys(item1), ...Object.keys(item2)])
  );

  for (const key of keys) {
    const v1 = (item1 as Record<string, any>)[key];
    const v2 = (item2 as Record<string, any>)[key];

    if (typeof v1 === "function" || typeof v2 === "function") continue;

    if (!(key in item2)) return false;
    if (skipAmount && key === "amount") continue;

    if (ObjectId.isValid(v1) && ObjectId.isValid(v2)) {
      if (!new ObjectId(v1).equals(new ObjectId(v2))) return false;
    } else if (
      (v1 === undefined || v1 === null) &&
      (v2 === undefined || v2 === null)
    )
      continue;
    else if (v1 !== v2) return false;
  }

  return true;
}

export type SingletonId =
  | "io"
  | "dungeon"
  | "sessionManager"
  | "collectionManager"
  | "mongoDb"
  | "playerManager"
  | "socketsByPlayerInstanceIds"
  | "socket"
  | "locations"
  | "minutesTillDungeonRegeneration";

export function getSingleton<T>(
  name: SingletonId,
  setter: (() => T) | undefined = undefined
): T | undefined {
  if (!(globalThis as any).singletons) {
    (globalThis as any).singletons = {} as Record<string, any>;
  }

  const singletons = (globalThis as any).singletons as any as Record<
    string,
    any
  >;

  if (!singletons[name]) {
    if (!setter) {
      return undefined;
    }

    singletons[name] = setter();
  }
  return singletons[name];
}

export function setSingleton<T>(name: SingletonId, value: T): void {
  if (!(globalThis as any).singletons) {
    (globalThis as any).singletons = {} as Record<string, any>;
  }

  const singletons = (globalThis as any).singletons as any as Record<
    string,
    any
  >;

  singletons[name] = value;
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

export function getFromOptionalFunc<TReturn, TArgs extends any[]>(
  func: OptionalFunc<TReturn, TArgs> | undefined,
  ...args: TArgs
): TReturn {
  if (typeof func !== "function") {
    return func as TReturn;
  }
  return (func as Function)(...args);
}

export function getTargetId(target: Targetable): string {
  if ("_id" in target) {
    return target._id.toString();
  }

  if ("id" in target) {
    return target.id.toString();
  }

  if ("name" in target) {
    return (target as any).name;
  }

  throw new Error(`Cannot get target ID from target: ${target}`);
}

export function importOnlyOnServer<T extends object>(filePath: string, obj: T) {
  if (typeof window !== "undefined") {
    return;
  }

  import(filePath).then((module) => {
    Object.assign(obj, module);
  });
}

export function savePlayer(player: PlayerInstance) {
  if (typeof window === "undefined")
    require("./PlayerManager").savePlayerServerOnly(player);
}

export function isInTown(id: LocationId) {
  return !id.startsWith("dungeon-") || id === "dungeon-entrance";
}
