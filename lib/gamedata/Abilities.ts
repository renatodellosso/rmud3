import Ability from "lib/types/Ability";
import { CreatureInstance } from "lib/types/creature";
import { OptionalFunc, DamageType, Targetable } from "lib/types/types";
import * as CanTarget from "lib/gamedata/CanTarget";

export function attack(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  damage: number,
  damageType: DamageType
): Ability {
  return {
    name,
    getDescription,
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(CanTarget.notSelf, CanTarget.isCreature),
    activate: (creature: CreatureInstance, targets: Targetable[]) => {
      if (targets.length !== 1) {
        throw new Error(
          `Expected exactly one target for ability ${name}, but got ${targets.length}.`
        );
      }

      const target = targets[0] as CreatureInstance;

      const damageDealt = target.takeDamage(damage, damageType);

      return `${creature.name} hit ${target.name} for ${damageDealt} ${damageType} using ${name}!`;
    },
  };
}
