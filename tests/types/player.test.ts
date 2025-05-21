import { PlayerInstance } from "lib/types/player";
import { OmitType } from "lib/types/utilstypes";
import { restoreFieldsAndMethods } from "lib/utils";
import { ObjectId } from "bson";
import { ItemTag } from "lib/types/item";

function getDefaultPlayer(): PlayerInstance {
  const player: PlayerInstance = {
    _id: new ObjectId(),
    location: "test",
    name: "test",
    health: 10,
    canActAt: new Date(),
    definitionId: "player",
    progressId: new ObjectId(),
    inventory: undefined as any,
    abilityScores: {
      Strength: 10,
      Constitution: 10,
      Intelligence: 10,
    },
    equipment: [],
  } as OmitType<PlayerInstance, Function> as PlayerInstance;

  restoreFieldsAndMethods(player, PlayerInstance.prototype);

  return player;
}

describe(PlayerInstance.name, () => {
  describe(PlayerInstance.prototype.canEquip.name, () => {
    test("Returns false for items that are not equipment", () => {
      const player = getDefaultPlayer();
      const item = {
        definitionId: "test",
        amount: 1,
        tags: [ItemTag.Equipment],
      };

      const result = player.canEquip(item);

      expect(result).toBe(false);
    });

    test("Returns true for items that are equipment when no other equipment is equipped", () => {
      const player = getDefaultPlayer();
      const item = {
        definitionId: "equipment1",
        amount: 1,
        tags: [ItemTag.Equipment],
      };

      const result = player.canEquip(item);

      expect(result).toBe(true);
    });

    test("Returns false when the maximum number of items are equipped", () => {
      const player = getDefaultPlayer();
      player.getMaxEquipment = () => 2; // Mock the getMaxEquipment method

      const item1 = {
        definitionId: "equipment1",
        amount: 1,
      };
      const item2 = {
        definitionId: "chestplate1",
        amount: 1,
      };
      const item3 = {
        definitionId: "equipment2",
        amount: 1,
      };

      player.equipment.push(item1, item2);

      const result = player.canEquip(item3);

      expect(result).toBe(false);
    });

    test("Returns true when the maximum number of items are not equipped", () => {
      const player = getDefaultPlayer();
      player.getMaxEquipment = () => 2; // Mock the getMaxEquipment method

      const item1 = {
        definitionId: "equipment1",
        amount: 1,
        tags: [ItemTag.Equipment],
      };
      const item2 = {
        definitionId: "chestplate1",
        amount: 1,
        tags: [ItemTag.Equipment],
      };

      player.equipment.push(item1);

      const result = player.canEquip(item2);

      expect(result).toBe(true);
    });

    test("Returns false when the item is already equipped", () => {
      const player = getDefaultPlayer();
      const item = {
        definitionId: "equipment1",
        amount: 1,
        tags: [ItemTag.Equipment],
      };

      player.equipment.push(item);

      const result = player.canEquip(item);

      expect(result).toBe(false);
    });

    test("Returns false when another item in the same slot is already equipped", () => {
      const player = getDefaultPlayer();
      const item1 = {
        definitionId: "chestplate1",
        amount: 1,
        tags: [ItemTag.Equipment],
      };
      const item2 = {
        definitionId: "chestplate1",
        amount: 1,
        tags: [ItemTag.Equipment],
      };

      player.equipment.push(item1);

      const result = player.canEquip(item2);

      expect(result).toBe(false);
    });
  });
});
