import * as CanTarget from "lib/gamedata/CanTarget";
import { CreatureInstance } from "lib/types/creature";

describe("CanTarget", () => {
  describe(CanTarget.and.name, () => {
    test("returns true if all conditions are met", () => {
      const condition1 = jest.fn(() => true);
      const condition2 = jest.fn(() => true);
      const combinedCondition = CanTarget.and(condition1, condition2);

      const creature = new CreatureInstance();
      const target = new CreatureInstance();

      expect(combinedCondition(creature, target)).toBe(true);
      expect(condition1).toHaveBeenCalledWith(creature, target);
      expect(condition2).toHaveBeenCalledWith(creature, target);
    });

    test("returns false if any condition is not met", () => {
      const condition1 = jest.fn(() => true);
      const condition2 = jest.fn(() => false);
      const combinedCondition = CanTarget.and(condition1, condition2);

      const creature = new CreatureInstance();
      const target = new CreatureInstance();

      expect(combinedCondition(creature, target)).toBe(false);
      expect(condition1).toHaveBeenCalledWith(creature, target);
      expect(condition2).toHaveBeenCalledWith(creature, target);
    });
  });

  describe(CanTarget.isCreature.name, () => {
    test("returns true for a CreatureInstance", () => {
      const creature = new CreatureInstance();
      expect(CanTarget.isCreature(creature, creature)).toBe(true);
    });

    test("returns false for a non-CreatureInstance", () => {
      const nonCreature = { name: "Not a creature" };
      expect(
        CanTarget.isCreature(new CreatureInstance(), nonCreature as any)
      ).toBe(false);
    });
  });

  describe(CanTarget.notSelf.name, () => {
    test("returns false if the target is the same as the creature", () => {
      const creature = new CreatureInstance();
      expect(CanTarget.notSelf(creature, creature)).toBe(false);
    });

    test("returns true if the target is different from the creature", () => {
      const creature1 = new CreatureInstance();
      const creature2 = new CreatureInstance();
      expect(CanTarget.notSelf(creature1, creature2)).toBe(true);
    });
  });
});
