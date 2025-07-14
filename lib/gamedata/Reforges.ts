import { WeightedTable } from "lib/types/WeightedTable";
import { ReforgeDefinition, ReforgeType } from "../types/Reforge";
import { DamageType } from "lib/types/Damage";
import AbilityScore from "lib/types/AbilityScore";

export type ReforgeId =
  | "sharp"
  | "fast"
  | "elegant"
  | "flamebrand"
  | "poisoned"
  | "profane"
  | "vengeful"
  | "reinforced"
  | "padded"
  | "indomitable"
  | "charged"
  | "steadfast"
  | "robust"
  | "bullStrength"
  | "souldrinker"
  | "rejuvenating"
  | "enduring"
  | "omniscient"
  | "wise"
  | "hearty"
  | "unbroken";

const reforges: Record<ReforgeId, ReforgeDefinition> = Object.freeze({
  sharp: {
    name: "Sharp",
    type: ReforgeType.Hand,
    weight: 1,
    getDescription: "Increases damage dealt by 10%.",
    damageBonusPercent: 1.1,
  },
  fast: {
    name: "Fast",
    type: ReforgeType.Hand,
    weight: 1,
    getDescription: "Reduces cooldowns by 10%.",
    cooldownPercent: 0.9,
  },
  elegant: {
    name: "Elegant",
    type: ReforgeType.Hand,
    weight: 1,
    getDescription: "Increases damage dealt by 5% and reduces cooldowns by 5%.",
    damageBonusPercent: 1.05,
    cooldownPercent: 0.95,
  },
  flamebrand: {
    name: "Flamebrand",
    type: ReforgeType.Hand,
    weight: 0.5,
    getDescription: (creature) =>
      `Attacks inflict Burning (${creature
        .scaleAbility(1)
        .toFixed()}) for ${creature.scaleAbility(3).toFixed(1)}s.`,
    onAttack: (creature, target, source, damage) => {
      target.addStatusEffect({
        id: "burning",
        strength: creature.scaleAbility(1),
        duration: creature.scaleAbility(3),
      });
    },
  },
  poisoned: {
    name: "Poisoned",
    type: ReforgeType.Hand,
    weight: 0.5,
    getDescription: (creature) =>
      `Attacks inflict Poison (${creature
        .scaleAbility(1)
        .toFixed()}) for ${creature.scaleAbility(3).toFixed(1)}s.`,
    onAttack: (creature, target, source, damage) => {
      target.addStatusEffect({
        id: "poisoned",
        strength: creature.scaleAbility(1),
        duration: creature.scaleAbility(3),
      });
    },
  },
  profane: {
    name: "Profane",
    type: ReforgeType.Hand,
    weight: 0.5,
    getDescription: (creature) =>
      `Attacks inflict Cursed (${creature
        .scaleAbility(1)
        .toFixed()}) for ${creature.scaleAbility(3).toFixed(1)}s.`,
    onAttack: (creature, target, source, damage) => {
      target.addStatusEffect({
        id: "cursed",
        strength: creature.scaleAbility(1),
        duration: creature.scaleAbility(3),
      });
    },
  },
  vengeful: {
    name: "Vengeful",
    type: ReforgeType.Hand,
    weight: 0.5,
    getDescription: "Increases damage dealt by 20% when health is under 20%.",
    getDamageToDeal: (creature, source, damage) =>
      damage.map((d) => ({
        type: d.type,
        amount:
          creature.health < 0.2 * creature.getMaxHealth()
            ? d.amount * 1.2
            : d.amount,
      })),
  },
  reinforced: {
    name: "Reinforced",
    type: ReforgeType.Armor,
    weight: 1,
    getDescription: "Increases damage resistances by 10%.",
    damageResistancePercent: 1.1,
  },
  padded: {
    name: "Padded",
    type: ReforgeType.Armor,
    weight: 1,
    getDescription: "Reduces incoming bludgeoning damage by 1.",
    getDamageResistances: [
      {
        type: DamageType.Bludgeoning,
        amount: 1,
      },
    ],
  },
  indomitable: {
    name: "Indomitable",
    type: ReforgeType.Armor,
    weight: 0.5,
    getDescription: "Reduces incoming damage by 30% when health is under 20%.",
    getDamageToTake: (creature, source, damage) =>
      damage.map((d) => ({
        type: d.type,
        amount:
          creature.health < 0.2 * creature.getMaxHealth()
            ? d.amount * 0.7
            : d.amount,
      })),
  },
  charged: {
    name: "Charged",
    type: ReforgeType.Armor,
    weight: 0.5,
    getDescription: (creature) =>
      `Applies Overcharged (${creature
        .scaleAbility(1)
        .toFixed()}) for ${creature
        .scaleAbility(3)
        .toFixed(1)}s when taking damage.`,
    onTakeDamage: (creature, source, damage) => {
      creature.addStatusEffect({
        id: "overcharged",
        strength: creature.scaleAbility(1),
        duration: creature.scaleAbility(3),
      });
    },
  },
  steadfast: {
    name: "Steadfast",
    type: ReforgeType.Armor,
    weight: 0.5,
    getDescription: "Increases your strength by 10% of its base value.",
    getAbilityScores: {
      [AbilityScore.Strength]: (creature) =>
        "abilityScores" in creature
          ? (creature.abilityScores as any)[AbilityScore.Strength] * 0.1
          : 0,
    },
  },
  robust: {
    name: "Robust",
    type: ReforgeType.Other,
    weight: 1,
    getDescription: "Increases maximum health by 10.",
    getMaxHealth: 10,
  },
  bullStrength: {
    name: "Bull Strength",
    type: ReforgeType.Other,
    weight: 1,
    getDescription: "Increases carrying capacity by 20 kg.",
    getCarryingCapacity: 20,
  },
  souldrinker: {
    name: "Soul Drinker",
    type: ReforgeType.Other,
    weight: 0.5,
    getDescription: (creature) =>
      `Heals for ${(
        creature.scaleAbility(0.02) * 100
      ).toFixed()}% of damage dealt, but applies Cursed (${creature
        .scaleAbility(1)
        .toFixed()}) for seconds equal to how much health was healed.`,
    onAttack: (creature, target, source, damage) => {
      const totalDamage = damage.reduce((sum, d) => sum + d.amount, 0);
      const healthAdded = totalDamage * creature.scaleAbility(0.02);

      creature.addHealth(healthAdded);
      creature.addStatusEffect({
        id: "cursed",
        strength: 1,
        duration: healthAdded,
      });
    },
  },
  rejuvenating: {
    name: "Rejuvenating",
    type: ReforgeType.Other,
    weight: 0.5,
    getDescription: "Heal 20% more whenever you heal.",
    getAmountToHeal: (creature, source, amount) => amount * 1.2,
  },
  enduring: {
    name: "Enduring",
    type: ReforgeType.Other,
    weight: 0.5,
    getDescription: "Increases status effect durations by 30%.",
    getStatusEffectDuration: (creature, effect) => effect.duration * 1.3,
  },
  omniscient: {
    name: "Omniscient",
    type: ReforgeType.Other,
    weight: 0.2,
    getDescription: (creature) =>
      `Increases your base intelligence by 40% of your current health, divided by your max health.`,
    getAbilityScores: {
      [AbilityScore.Intelligence]: (creature) =>
        "abilityScores" in creature
          ? (((creature.abilityScores as any)[AbilityScore.Intelligence] *
              creature.health) /
              creature.getMaxHealth()) *
            0.4
          : 0,
    },
  },
  wise: {
    name: "Wise",
    type: ReforgeType.Other,
    weight: 0.2,
    getDescription: (creature) => `Increases your XP gain by 5%`,
    getXpToAdd: (creature, source, amount) => amount * 1.05,
  },
  hearty: {
    name: "Hearty",
    type: ReforgeType.Other,
    weight: 0.2,
    getDescription: (creature) =>
      `Increases your maximum health by your base strength`,
    getMaxHealth: (creature) =>
      "abilityScores" in creature
        ? (creature.abilityScores as any)[AbilityScore.Strength]
        : 0,
  },
  unbroken: {
    name: "Unbroken",
    type: ReforgeType.Other,
    weight: 0.2,
    getDescription: (creature) => `Deal 25% more damage at max health`,
    getDamageToDeal: (creature, source, damage) =>
      damage.map((d) => ({
        type: d.type,
        amount:
          creature.health === creature.getMaxHealth()
            ? d.amount * 1.25
            : d.amount,
      })),
  },
} satisfies Record<ReforgeId, ReforgeDefinition>);

export default reforges;

export const reforgeTablesByType: Record<
  ReforgeType,
  WeightedTable<ReforgeId>
> = {
  [ReforgeType.Hand]: new WeightedTable<ReforgeId>(
    Object.entries(reforges)
      .filter(([_, def]) => def.type === ReforgeType.Hand)
      .map(([id, def]) => ({
        item: id as ReforgeId,
        weight: def.weight,
        amount: 1,
      }))
  ),
  [ReforgeType.Armor]: new WeightedTable<ReforgeId>(
    Object.entries(reforges)
      .filter(([_, def]) => def.type === ReforgeType.Armor)
      .map(([id, def]) => ({
        item: id as ReforgeId,
        weight: def.weight,
        amount: 1,
      }))
  ),
  [ReforgeType.Other]: new WeightedTable<ReforgeId>(
    Object.entries(reforges)
      .filter(([_, def]) => def.type === ReforgeType.Other)
      .map(([id, def]) => ({
        item: id as ReforgeId,
        weight: def.weight,
        amount: 1,
      }))
  ),
};
