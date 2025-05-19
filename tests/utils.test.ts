import { restoreFieldsAndMethods } from "lib/utils";

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
