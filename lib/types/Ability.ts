import { CreatureInstance } from "./creature";
import { Targetable } from "./types";
import { OptionalFunc } from "./types";

type Ability = {
  name: string;
  getDescription: OptionalFunc<string, CreatureInstance>;
  /**
   * @returns the cooldown in milliseconds
   */
  getCooldown: OptionalFunc<number, CreatureInstance>;
  getTargetCount: OptionalFunc<number, CreatureInstance>;
  canTarget: OptionalFunc<boolean, [CreatureInstance, Targetable]>;
  activate: OptionalFunc<void, [CreatureInstance, Targetable[]]>;
};

export default Ability;
