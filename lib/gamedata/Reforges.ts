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
    getDescription: "Increases damage dealt by 10%.",
    damageBonusPercent: 1.1,
  },
  fast: {
    name: "Fast",
    type: ReforgeType.Hand,
    getDescription: "Reduces cooldowns by 10%.",
    cooldownPercent: 0.9,
  },
  elegant: {
    name: "Elegant",
    type: ReforgeType.Hand,
    getDescription: "Increases damage dealt by 5% and reduces cooldowns by 5%.",
    damageBonusPercent: 1.05,
    cooldownPercent: 0.95,
  },
  flamebrand: {
    name: "Flamebrand",
    type: ReforgeType.Hand,
    getDescription: "Attacks inflict Burning (1) for 3s.",
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
    getDescription: "Increases damage resistances by 10%.",
    type: ReforgeType.Armor,
    damageResistancePercent: 1.1,
  },
  charged: {
    name: "Charged",
    type: ReforgeType.Armor,
    getDescription: "Applies Overcharged (1) for 3s when taking damage.",
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
    getDescription: "Increases maximum health by 10.",
    getMaxHealth: 10,
  },
} satisfies Record<ReforgeId, ReforgeDefinition>);

export default reforges;
