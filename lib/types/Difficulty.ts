enum Difficulty {
  Normal = "Normal",
  Hard = "Hard",
  VeryHard = "VeryHard",
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
  baseHealth?: number;
  healthBonusFromConstitution?: number;
  inventoryHandlingOnDeath: InventoryHandlingOnDeath;
};

export const difficultyOptions: Record<Difficulty, DifficultyOptions> = {
  [Difficulty.Normal]: {
    name: "Adventurer",
    description: "The standard experience.",
    inventoryHandlingOnDeath: InventoryHandlingOnDeath.KeepItems,
  },
  [Difficulty.Hard]: {
    name: "Hero",
    description: "A challenging experience for seasoned players.",
    baseHealth: 30,
    healthBonusFromConstitution: 4,
    inventoryHandlingOnDeath: InventoryHandlingOnDeath.DropItems,
  },
  [Difficulty.VeryHard]: {
    name: "Legend",
    description: "A brutal experience for the most masterful players.",
    baseHealth: 20,
    healthBonusFromConstitution: 2,
    inventoryHandlingOnDeath: InventoryHandlingOnDeath.DestroyItems,
  },
};
