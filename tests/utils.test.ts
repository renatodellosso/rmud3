import { ItemDefinition, ItemInstance } from "lib/types/types";
import { areItemInstancesEqual, restoreFieldsAndMethods } from "lib/utils";

describe(restoreFieldsAndMethods.name, () => {
  test("restores methods from prototype to object", () => {
    const obj = {
      a: 1,
      method1: undefined as jest.Mock | undefined,
    };

    const prototype = {
      a: 1,
      method1: jest.fn(),
    };

    restoreFieldsAndMethods(obj, prototype);

    expect(obj.method1).toBeDefined();
    expect(obj.method1).toBe(prototype.method1);

    obj.method1!();
    expect(prototype.method1).toHaveBeenCalled();
  });

  test("does not override existing methods", () => {
    const obj = {
      a: 1,
      method1: jest.fn(),
    };

    const prototype = {
      a: 1,
      method1: jest.fn(),
    };

    restoreFieldsAndMethods(obj, prototype);

    expect(obj.method1).toBeDefined();
    expect(obj.method1).not.toBe(prototype.method1);

    obj.method1!();
    expect(obj.method1).toHaveBeenCalled();
  });
});

describe(areItemInstancesEqual.name, () => {
  test("returns true for equal item instances", () => {
    const item1: ItemInstance = {
      definitionId: "test",
      amount: 1,
    };

    const item2: ItemInstance = {
      definitionId: "test",
      amount: 2,
    };

    expect(areItemInstancesEqual(item1, item2)).toBe(true);
  });

  test("returns false for different item instances", () => {
    const item1: ItemInstance = {
      definitionId: "test",
      amount: 1,
    };

    const item2: ItemInstance = {
      definitionId: "test2",
      amount: 1,
    };

    expect(areItemInstancesEqual(item1, item2)).toBe(false);
  });

  test("returns false for different item instances with different amounts when skipAmounts is false", () => {
    const item1: ItemInstance = {
      definitionId: "test",
      amount: 1,
    };

    const item2: ItemInstance = {
      definitionId: "test",
      amount: 2,
    };

    expect(areItemInstancesEqual(item1, item2, false)).toBe(false);
  });
  test("returns true for equal item instances with equal amounts when skipAmounts is false", () => {
    const item1: ItemInstance = {
      definitionId: "test",
      amount: 1,
    };

    const item2: ItemInstance = {
      definitionId: "test",
      amount: 1,
    };

    expect(areItemInstancesEqual(item1, item2, false)).toBe(true);
  });
});
