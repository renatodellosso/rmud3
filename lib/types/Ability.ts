import items from "lib/gamedata/items";
import { CreatureInstance } from "./entities/creature";
import { ItemInstance } from "./item";
import { DamageType, Targetable } from "./types";
import { OptionalFunc } from "./types";
import { StatusEffectInstance } from "./statuseffect";

export type AbilitySource =
  | ItemInstance
  | CreatureInstance
  | StatusEffectInstance;

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
  ) => boolean;
};

export default Ability;

export type AbilityWithSource = {
  ability: Ability;
  source: AbilitySource;
};

export function getAbilitySourceName(source: AbilitySource): string {
  if (source instanceof CreatureInstance) {
    return source.name;
  } else if ("definitionId" in source && "amount" in source) {
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
