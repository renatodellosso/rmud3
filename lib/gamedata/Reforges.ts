import { ReforgeDefinition } from '../types/Reforge';


export type ReforgeId = 
  | "sharp"
  | "fast";

const reforges: Record<ReforgeId, ReforgeDefinition> = Object.freeze({
  sharp: {
    name: "Sharp",
    damagePercent: 1.1,
  },
  fast: {
    name: "Fast",
    cooldownPercent: 0.9,
  },
} satisfies Record<ReforgeId, ReforgeDefinition>);