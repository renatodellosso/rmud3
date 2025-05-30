import { ItemInstance } from "lib/types/item";
import { PlayerInstance } from "lib/types/player";
import {
  areItemInstancesEqual,
  getSingleton,
  restoreFieldsAndMethods,
} from "lib/utils";

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

  test("Works on instances of classes", () => {
    class TestClass {
      methodA() {}
    }

    const obj = {} as any as TestClass;
    const prototype = TestClass.prototype;

    restoreFieldsAndMethods(obj, prototype);

    expect(obj.methodA).toBeDefined();
    expect(obj.methodA).toBe(prototype.methodA);
  });

  test("Works on nested classes", () => {
    class NestedClass {
      methodB() {}
    }

    class TestClass {
      nested: NestedClass = {} as any as NestedClass;
      constructor() {
        this.nested = new NestedClass();
      }
    }

    const obj = {} as any as TestClass;
    const prototype = TestClass.prototype;

    restoreFieldsAndMethods(obj, new TestClass());

    expect(obj.nested.methodB).toBeDefined();
    expect(obj.nested.methodB).toBe(NestedClass.prototype.methodB);
  });

  test("Works on PlayerInstance", () => {
    const player: Partial<PlayerInstance> = {
      equipment: {
        items: [
          {
            definitionId: "equipment1",
            amount: 1,
          } as ItemInstance,
        ],
      },
    } as any;
    const prototype = new PlayerInstance();

    restoreFieldsAndMethods(player, prototype);

    expect(player.getMaxHealth).toBeDefined();
    expect(player.getMaxHealth).toBe(prototype.getMaxHealth);
    expect(player.getAbilityScore).toBeDefined();
    expect(player.getAbilityScore).toBe(prototype.getAbilityScore);
    expect(player.getAbilities).toBeDefined();
    expect(player.getAbilities).toBe(prototype.getAbilities);

    expect(player.equipment?.canEquip).toBeDefined();
    expect(player.equipment?.canEquip).toBe(prototype.equipment.canEquip);

    expect(player.consumables?.canEquip).toBeDefined();
    expect(player.consumables?.canEquip).toBe(prototype.consumables.canEquip);
  });

  test("restores methods from superclass", () => {
    class SuperClass {
      methodSuper() {}
    }

    class SubClass extends SuperClass {
      methodSub() {}
    }

    const obj = {} as any as SubClass;
    const prototype = SubClass.prototype;

    restoreFieldsAndMethods(obj, prototype);

    expect(obj.methodSuper).toBeDefined();
    expect(obj.methodSuper).toBe(SuperClass.prototype.methodSuper);
    expect(obj.methodSub).toBeDefined();
    expect(obj.methodSub).toBe(prototype.methodSub);
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

describe(getSingleton.name, () => {
  beforeEach(() => {
    // Clear the singleton cache before each test
    (globalThis as any).singletons = {};
  });

  test("returns the same instance for the same name", () => {
    const instance1 = getSingleton("test" as any, () => {
      return { value: 1 };
    });

    const instance2 = getSingleton("test" as any, () => {
      return { value: 2 };
    });

    expect(instance1).toBe(instance2);
    expect(instance1?.value).toBe(1);
  });

  test("returns different instances for different names", () => {
    const instance1 = getSingleton("test1" as any, () => {
      return { value: 1 };
    });

    const instance2 = getSingleton("test2" as any, () => {
      return { value: 2 };
    });

    expect(instance1).not.toBe(instance2);
    expect(instance1?.value).toBe(1);
    expect(instance2?.value).toBe(2);
  });

  test("does not run setter function if instance already exists", () => {
    const setter = jest.fn(() => {
      return { value: 1 };
    });

    const instance1 = getSingleton("test" as any, setter);
    const instance2 = getSingleton("test" as any, setter);

    expect(instance1).toBe(instance2);
    expect(setter).toHaveBeenCalledTimes(1);
  });
});
