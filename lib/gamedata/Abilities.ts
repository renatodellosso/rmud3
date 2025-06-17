import Ability from "lib/types/Ability";
import { CreatureInstance } from "lib/types/creature";
import { OptionalFunc, DamageType, Targetable } from "lib/types/types";
import * as CanTarget from "lib/gamedata/CanTarget";
import { getIo } from "lib/ClientFriendlyIo";

export function attack(
  name: string,
  getDescription: OptionalFunc<string, CreatureInstance>,
  getCooldown: OptionalFunc<number, CreatureInstance>,
  damage: number,
  damageType: DamageType,
  targetRestrictions?: ((
    creature: CreatureInstance,
    target: Targetable
  ) => boolean)[]
): Ability {
  return {
    name,
    getDescription,
    getCooldown,
    getTargetCount: 1,
    canTarget: CanTarget.and(
      CanTarget.notSelf,
      CanTarget.isTargetACreature,
      ...(targetRestrictions ?? [])
    ),
    activate: (creature: CreatureInstance, targets: Targetable[]) => {
      if (targets.length !== 1) {
        throw new Error(
          `Expected exactly one target for ability ${name}, but got ${targets.length}.`
        );
      }

      const target = targets[0] as CreatureInstance;

      const damageDealt = target.takeDamage(damage, damageType);

      getIo().sendMsgToRoom(
        creature.location,
        `${creature.name} hit ${target.name} for ${damageDealt} ${damageType} using ${name}!`
      );
    },
  };
}
