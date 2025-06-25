

export type ReforgeDefinition = {
  name: string;
  type: ReforgeType;
  damagePercent?: number;
  cooldownPercent?: number;
}

export enum ReforgeType {
  Weapon,
  Armor,
  Other
}