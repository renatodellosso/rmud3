import { ItemInstance } from "./item";
import StatAndAbilityProvider from "./StatAndAbilityProvider";
import { DamageWithType } from "./types";

export type ReforgeDefinition = StatAndAbilityProvider<ItemInstance> & {
  name: string;
  type: ReforgeType;
  damageBonusPercent?: number;
  cooldownPercent?: number;
  damageResistancePercent?: number;
};

export enum ReforgeType {
  Hand,
  Armor,
  Other,
}
