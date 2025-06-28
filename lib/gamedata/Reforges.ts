import { ReforgeDefinition, ReforgeType } from "../types/Reforge";

export type ReforgeId = 
  | "sharp" 
  | "fast"
  | "elegant"
  | "reinforced"
  | "robust";

const reforges: Record<ReforgeId, ReforgeDefinition> = Object.freeze({
  sharp: {
    name: "Sharp",
    type: ReforgeType.Weapon,
    damageBonusPercent: 1.1,
  },
  fast: {
    name: "Fast",
    type: ReforgeType.Weapon,
    cooldownPercent: 0.9,
  },
  elegant: {
    name: "Elegant",
    type: ReforgeType.Weapon,
    damageBonusPercent: 1.05,
    cooldownPercent: 0.95,
  },
  reinforced: {
    name: "Reinforced",
    type: ReforgeType.Armor,
    damageResistancePercent: 1.1,
  },
  robust: {
    name: "Robust",
    type: ReforgeType.Other,
    getMaxHealth: 10,
  },
} satisfies Record<ReforgeId, ReforgeDefinition>);

export default reforges;
