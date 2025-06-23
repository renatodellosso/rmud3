enum Difficulty {
  Normal = "Normal",
  Hard = "Hard",
  VeryHard = "VeryHard",
  Insane = "Insane",
}

export default Difficulty;

export const enum InventoryHandlingOnDeath {
  KeepItems = "Keep Items",
  DropItems = "Drop Items",
  DestroyItems = "Destroy Items",
}

type DifficultyOptions = {
  name: string;
  description: string;
  baseHealthMultiplier: number;
  healthBonusFromConstitution?: number;
  inventoryHandlingOnDeath: InventoryHandlingOnDeath;
};

export const difficultyOptions: Record<Difficulty, DifficultyOptions> = {
  [Difficulty.Normal]: {
    name: "Adventurer",
    description: "The standard experience.",
    baseHealthMultiplier: 1,
    inventoryHandlingOnDeath: InventoryHandlingOnDeath.KeepItems,
  },
  [Difficulty.Hard]: {
    name: "Veteran",
    description: "A more challenging experience for experienced players.",
    baseHealthMultiplier: 0.75,
    healthBonusFromConstitution: 4,
    inventoryHandlingOnDeath: InventoryHandlingOnDeath.KeepItems,
  },
  [Difficulty.VeryHard]: {
    name: "Hero",
    description: "A challenging experience for seasoned players.",
    baseHealthMultiplier: 0.75,
    healthBonusFromConstitution: 4,
    inventoryHandlingOnDeath: InventoryHandlingOnDeath.DropItems,
  },
  [Difficulty.Insane]: {
    name: "Legend",
    description: "A brutal experience for the most masterful players.",
    baseHealthMultiplier: 0.5,
    healthBonusFromConstitution: 2,
    inventoryHandlingOnDeath: InventoryHandlingOnDeath.DestroyItems,
  },
};
