import { ReforgeDefinition, ReforgeType } from "../types/Reforge";

export type ReforgeId =
  | "sharp"
  | "fast"
  | "elegant"
  | "flamebrand"
  | "reinforced"
  | "charged"
  | "robust";

const reforges: Record<ReforgeId, ReforgeDefinition> = Object.freeze({
  sharp: {
    name: "Sharp",
    type: ReforgeType.Hand,
    damageBonusPercent: 1.1,
  },
  fast: {
    name: "Fast",
    type: ReforgeType.Hand,
    cooldownPercent: 0.9,
  },
  elegant: {
    name: "Elegant",
    type: ReforgeType.Hand,
    damageBonusPercent: 1.05,
    cooldownPercent: 0.95,
  },
  flamebrand: {
    name: "Flamebrand",
    type: ReforgeType.Hand,
    onAttack: (creature, target, source, damage) => {
      target.addStatusEffect({
        id: "burning",
        strength: creature.scaleAbility(1),
        duration: creature.scaleAbility(3),
      });
    },
  },
  reinforced: {
    name: "Reinforced",
    type: ReforgeType.Armor,
    damageResistancePercent: 1.1,
  },
  charged: {
    name: "Charged",
    type: ReforgeType.Armor,
    onTakeDamage: (creature, source, damage) => {
      creature.addStatusEffect({
        id: "overcharged",
        strength: creature.scaleAbility(1),
        duration: creature.scaleAbility(3),
      });
    },
  },
  robust: {
    name: "Robust",
    type: ReforgeType.Other,
    getMaxHealth: 10,
  },
} satisfies Record<ReforgeId, ReforgeDefinition>);

export default reforges;
