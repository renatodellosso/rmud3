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
