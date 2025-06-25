import { ReforgeDefinition, ReforgeType } from '../types/Reforge';


export type ReforgeId = 
  | "sharp"
  | "fast";

const reforges: Record<ReforgeId, ReforgeDefinition> = Object.freeze({
  sharp: {
    name: "Sharp",
    type: ReforgeType.Weapon,
    damagePercent: 1.1,
  },
  fast: {
    name: "Fast",
    type: ReforgeType.Weapon,
    cooldownPercent: 0.9,
  },
} satisfies Record<ReforgeId, ReforgeDefinition>);

export default reforges;