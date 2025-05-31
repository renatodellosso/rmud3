import items from "lib/gamedata/items";
import { CreatureInstance, CreatureDefinition } from "./creature";
import { ItemInstance } from "./item";
import { DamageType, Targetable } from "./types";
import { OptionalFunc } from "./types";
import creatures from "lib/gamedata/creatures";
import { sendMsgToRoom } from "./socketioserverutils";

export type AbilitySource = ItemInstance | CreatureInstance;

type Ability = {
  name: string;
  getDescription: OptionalFunc<string, [CreatureInstance, AbilitySource]>;
  /**
   * @returns the cooldown in milliseconds
   */
  getCooldown: OptionalFunc<number, [CreatureInstance, AbilitySource]>;
  getTargetCount: OptionalFunc<number, [CreatureInstance, AbilitySource]>;
  canTarget: OptionalFunc<
    boolean,
    [CreatureInstance, Targetable, AbilitySource]
  >;
  /**
   * @returns the message to send to the room
   */
  activate: (
    creature: CreatureInstance,
    targets: Targetable[],
    source: AbilitySource
  ) => string;
};

export default Ability;

export function getAbilitySourceName(source: AbilitySource): string {
  if (source instanceof CreatureInstance) {
    return source.name;
  } else if ("definitionId" in source) {
    const item = items[source.definitionId];

    if (!item) {
      throw new Error(
        `Item with definitionId ${source.definitionId} not found`
      );
    }

    return item.name;
  } else {
    throw new Error("Unknown ability source type");
  }
}

export namespace CanTarget {
  export function and(
    ...args: ((creature: CreatureInstance, target: Targetable) => boolean)[]
  ): (creature: CreatureInstance, target: Targetable) => boolean {
    return (creature: CreatureInstance, target: Targetable) =>
      args.every((arg) => arg(creature, target));
  }

  export function notSelf(
    creature: CreatureInstance,
    target: Targetable
  ): boolean {
    if (!("definitionId" in target) || !("name" in creature)) {
      return false;
    }

    return (
      target.definitionId !== creature.definitionId ||
      target.name !== creature.name
    );
  }

  export function isCreature(
    creature: CreatureInstance,
    target: Targetable
  ): boolean {
    if (!("definitionId" in target)) {
      return false;
    }

    return target.definitionId in creatures;
  }
}

export namespace Abilities {
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
        console.log(
          `${creature.name} attacks ${target.name} for ${damage} ${damageType}!`
        );

        const damageDealt = target.takeDamage(damage, damageType);

        return `${creature.name} hit ${target.name} for ${damageDealt} ${damageType} using ${name}!`;
      },
    };
  }
}
