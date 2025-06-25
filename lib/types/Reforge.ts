export type ReforgeDefinition = {
  name: string;
  type: ReforgeType;
  damageBonusPercent?: number;
  cooldownPercent?: number;
  damageResistancePercent?: number;
};

export enum ReforgeType {
  Weapon,
  Armor,
  Other,
}
