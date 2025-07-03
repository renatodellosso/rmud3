import { ItemInstance } from "./item";
import StatAndAbilityProvider from "./StatAndAbilityProvider";
import { OptionalFunc } from "./types";

export type ReforgeDefinition = StatAndAbilityProvider<ItemInstance> & {
  name: string;
  type: ReforgeType;
  weight: number;
  getDescription: OptionalFunc<string, [ItemInstance]>;
  damageBonusPercent?: number;
  cooldownPercent?: number;
  damageResistancePercent?: number;
};

export enum ReforgeType {
  Hand,
  Armor,
  Other,
}
