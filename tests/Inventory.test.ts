import { DirectInventory } from "lib/Inventory";
import { ItemInstance } from "lib/item";

describe(DirectInventory.name, () => {
  describe(DirectInventory.prototype.add.name, () => {
    test("adds a new item if it is not already present", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = { definitionId: "test", amount: 1 };

      expect(inventory.add(item)).toBe(1);
      expect(inventory.items).toEqual([item]);
    });

    test("increases the amount of an existing item", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = { definitionId: "test", amount: 1 };
      const item2: ItemInstance = { definitionId: "test", amount: 2 };

      expect(inventory.add(item)).toBe(1);
      expect(inventory.add(item2)).toBe(2);

      expect(inventory.items).toEqual([{ definitionId: "test", amount: 3 }]);
    });

    test("adds a new item when an existing item is not equal", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = { definitionId: "test", amount: 1 };
      const item2: ItemInstance = { definitionId: "test2", amount: 2 };

      expect(inventory.add(item)).toBe(1);
      expect(inventory.add(item2)).toBe(2);

      expect(inventory.items).toEqual([item, item2]);
    });
  });

  describe(DirectInventory.prototype.remove.name, () => {
    test("removes an item from the inventory", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = { definitionId: "test", amount: 1 };

      inventory.add(item);
      const removedAmount = inventory.remove(item);

      expect(removedAmount).toBe(1);
      expect(inventory.items).toEqual([]);
    });

    test("removes only the specified amount of an item", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = { definitionId: "test", amount: 3 };

      inventory.add(item);
      const removedAmount = inventory.remove({ ...item, amount: 2 });

      expect(removedAmount).toBe(2);
      expect(inventory.items).toEqual([{ definitionId: "test", amount: 1 }]);
    });

    test("does not remove an item if it is not in the inventory", () => {
      const inventory = new DirectInventory();

      const removedAmount = inventory.remove({ definitionId: "test", amount: 2 });

      expect(removedAmount).toBe(0);
    });

    test("removes an item completely if the amount is greater than the inventory", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = { definitionId: "test", amount: 1 };

      inventory.add(item);
      const removedAmount = inventory.remove({ ...item, amount: 2 });

      expect(removedAmount).toBe(1);
      expect(inventory.items).toEqual([]);
    });

    test("does not remove unrelated items", () => {
      const inventory = new DirectInventory();
      const item1: ItemInstance = { definitionId: "test", amount: 1 };
      const item2: ItemInstance = { definitionId: "test2", amount: 1 };

      inventory.add(item1);
      inventory.add(item2);
      const removedAmount = inventory.remove({ ...item1, amount: 2 });

      expect(removedAmount).toBe(1);
      expect(inventory.items).toEqual([item2]);
    });
  });
});