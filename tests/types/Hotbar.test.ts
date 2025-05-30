import { ConsumableHotbar, EquipmentHotbar } from "lib/types/Hotbar";
import { ItemInstance } from "lib/types/item";

describe(EquipmentHotbar.name, () => {
  describe(EquipmentHotbar.prototype.canEquip.name, () => {
    test("returns true if the item can be equipped", () => {
      const hotbar = new EquipmentHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "equipment1", amount: 1 };

      hotbar.items = [];
      expect(hotbar.canEquip(player, item)).toBe(true);
    });

    test("returns false if the item is already in the hotbar", () => {
      const hotbar = new EquipmentHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "equipment1", amount: 1 };

      hotbar.items = [item];
      expect(hotbar.canEquip(player, item)).toBe(false);
    });
  });

  describe(EquipmentHotbar.prototype.equip.name, () => {
    test("equips an item if it can be equipped", () => {
      const hotbar = new EquipmentHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "equipment1", amount: 1 };

      hotbar.items = [];
      expect(hotbar.equip(player, item)).toBe(true);
      expect(hotbar.items).toContain(item);
    });

    test("does not equip an item if it cannot be equipped", () => {
      const hotbar = new EquipmentHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "equipment1", amount: 1 };

      hotbar.items = [item];
      expect(hotbar.equip(player, item)).toBe(false);
    });
  });

  describe(EquipmentHotbar.prototype.unequip.name, () => {
    test("unequips an item if it is in the hotbar", () => {
      const hotbar = new EquipmentHotbar();
      const item: ItemInstance = { definitionId: "equipment1", amount: 1 };

      hotbar.items = [item];
      expect(hotbar.unequip(item)).toBe(true);
      expect(hotbar.items).not.toContain(item);
    });

    test("does not unequip an item if it is not in the hotbar", () => {
      const hotbar = new EquipmentHotbar();
      const item: ItemInstance = { definitionId: "equipment1", amount: 1 };
      const otherItem: ItemInstance = { definitionId: "equipment2", amount: 1 };

      hotbar.items = [otherItem];
      expect(hotbar.unequip(item)).toBe(false);
    });
  });
});

describe(ConsumableHotbar.name, () => {
  describe(ConsumableHotbar.prototype.canEquip.name, () => {
    test("returns true if the item can be equipped", () => {
      const hotbar = new ConsumableHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "consumable1", amount: 1 };

      hotbar.items = [];
      expect(hotbar.canEquip(player, item)).toBe(true);
    });

    test("returns false if the item is already in the hotbar", () => {
      const hotbar = new ConsumableHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "consumable1", amount: 1 };

      hotbar.items = [item];
      expect(hotbar.canEquip(player, item)).toBe(false);
    });
  });

  describe(ConsumableHotbar.prototype.equip.name, () => {
    test("equips an item if it can be equipped", () => {
      const hotbar = new ConsumableHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "consumable1", amount: 1 };

      hotbar.items = [];
      expect(hotbar.equip(player, item)).toBe(true);
      expect(hotbar.items).toContain(item);
    });

    test("does not equip an item if it cannot be equipped", () => {
      const hotbar = new ConsumableHotbar();
      const player = {} as any; // Mock player instance
      const item = { definitionId: "consumable1", amount: 1 };

      hotbar.items = [item];
      expect(hotbar.equip(player, item)).toBe(false);
    });
  });

  describe(ConsumableHotbar.prototype.unequip.name, () => {
    test("unequips an item if it is in the hotbar", () => {
      const hotbar = new ConsumableHotbar();
      const item: ItemInstance = { definitionId: "consumable1", amount: 1 };

      hotbar.items = [item];
      expect(hotbar.unequip(item)).toBe(true);
      expect(hotbar.items).not.toContain(item);
    });

    test("does not unequip an item if it is not in the hotbar", () => {
      const hotbar = new ConsumableHotbar();
      const item: ItemInstance = { definitionId: "consumable1", amount: 1 };
      const otherItem: ItemInstance = {
        definitionId: "consumable2",
        amount: 1,
      };

      hotbar.items = [otherItem];
      expect(hotbar.unequip(item)).toBe(false);
    });
  });
});
