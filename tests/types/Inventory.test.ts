import items from "lib/gamedata/items";
import { DirectInventory, MultipleInventory } from "lib/types/Inventory";
import { ItemInstance } from "lib/types/item";
import { getFromOptionalFunc } from "../../lib/utils";

describe(DirectInventory.name, () => {
  describe(DirectInventory.prototype.add.name, () => {
    test("adds a new item if it is not already present", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = new ItemInstance("coal", 1);

      expect(inventory.add(item)).toBe(1);
      expect(inventory.items).toEqual([item]);
    });

    test("increases the amount of an existing item", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = new ItemInstance("coal", 1);
      const item2: ItemInstance = new ItemInstance("coal", 2);

      expect(inventory.add(item)).toBe(1);
      expect(inventory.add(item2)).toBe(2);

      expect(inventory.items).toEqual([{ definitionId: "coal", amount: 3 }]);
    });

    test("adds a new item when an existing item is not equal", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = new ItemInstance("coal", 1);
      const item2: ItemInstance = new ItemInstance("ironOre", 2);

      expect(inventory.add(item)).toBe(1);
      expect(inventory.add(item2)).toBe(2);

      expect(inventory.items).toEqual([item, item2]);
    });
  });

  describe(DirectInventory.prototype.remove.name, () => {
    test("removes an item from the inventory", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = new ItemInstance("coal", 1);

      inventory.add(item);
      const removedAmount = inventory.remove(item);

      expect(removedAmount).toBe(1);
      expect(inventory.items).toEqual([]);
    });

    test("removes only the specified amount of an item", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = new ItemInstance("coal", 3);

      inventory.add(item);
      const removedAmount = inventory.remove(new ItemInstance("coal", 2));

      expect(removedAmount).toBe(2);
      expect(inventory.items).toEqual([new ItemInstance("coal", 1)]);
    });

    test("does not remove an item if it is not in the inventory", () => {
      const inventory = new DirectInventory();

      const removedAmount = inventory.remove(new ItemInstance("coal", 2));

      expect(removedAmount).toBe(0);
    });

    test("removes an item completely if the amount is greater than the inventory", () => {
      const inventory = new DirectInventory();
      const item: ItemInstance = new ItemInstance("coal", 1);

      inventory.add(item);
      const removedAmount = inventory.remove(new ItemInstance("coal", 2));

      expect(removedAmount).toBe(1);
      expect(inventory.items).toEqual([]);
    });

    test("does not remove unrelated items", () => {
      const inventory = new DirectInventory();
      const item1: ItemInstance = new ItemInstance("coal", 1);
      const item2: ItemInstance = new ItemInstance("ironOre", 1);

      inventory.add(item1);
      inventory.add(item2);
      const removedAmount = inventory.remove(new ItemInstance("coal", 2));

      expect(removedAmount).toBe(1);
      expect(inventory.items).toEqual([item2]);
    });
  });
});

describe(MultipleInventory.name, () => {
  describe(MultipleInventory.prototype.add.name, () => {
    test("adds an item to the first inventory that can accommodate it", () => {
      const inventory1 = new DirectInventory();
      const inventory2 = new DirectInventory();
      const multipleInventory = new MultipleInventory([inventory1, inventory2]);
      const item: ItemInstance = new ItemInstance("coal", 5);

      expect(multipleInventory.add(item)).toBe(5);
      
      expect(inventory1.items).toEqual([item]);
      expect(inventory2.items).toEqual([]);
    });

    test("spreads an item across multiple inventories if necessary", () => {
      const inventory1 = new DirectInventory();
      const inventory2 = new DirectInventory();
      const multipleInventory = new MultipleInventory([inventory1, inventory2]);
      const item: ItemInstance = new ItemInstance("coal", 10);

      expect(multipleInventory.add(item)).toBe(10);
      expect(inventory1.items).toEqual([new ItemInstance("coal", 10)]);
      expect(inventory2.items).toEqual([]);
    });

    test("adds only the amount that can be accommodated in each inventory", () => {
      const inventory1 = new DirectInventory(
        [],
        getFromOptionalFunc(items["coal"].getWeight, undefined as any) * 5
      );
      const inventory2 = new DirectInventory(
        [],
        getFromOptionalFunc(items["coal"].getWeight, undefined as any) * 10
      );
      const multipleInventory = new MultipleInventory([inventory1, inventory2]);
      const item: ItemInstance = new ItemInstance("coal", 15);

      inventory1.add(new ItemInstance("coal", 10));

      expect(multipleInventory.add(item)).toBe(5);

      expect(inventory1.items.length).toEqual(1);
      expect(inventory1.items[0].definitionId).toEqual("coal");
      expect(inventory1.items[0].amount).toEqual(5);

      expect(inventory2.items.length).toEqual(1);
      expect(inventory2.items[0].definitionId).toEqual("coal");
      expect(inventory2.items[0].amount).toEqual(10);
    });
  });
});
