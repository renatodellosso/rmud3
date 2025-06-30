import { ItemInstance } from "./item";
import StatAndAbilityProvider from './StatAndAbilityProvider';

export type ReforgeDefinition = StatAndAbilityProvider<ItemInstance> & 
{
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
