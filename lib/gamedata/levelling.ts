export function getXpForNextLevel(level: number): number {
  if (level < 1) {
    return 100;
  }
  return 100 * Math.pow(1.1, level) + getXpForNextLevel(level - 1);
}

export const equipmentLimitByLevel: Record<number, number> = {
  1: 2,
  3: 3,
  10: 4,
  25: 5,
  50: 6,
};

export function getEquipmentLimitForLevel(level: number): number {
  const sortedLevels = Object.keys(equipmentLimitByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  for (const lvl of sortedLevels) {
    if (level < lvl) {
      return equipmentLimitByLevel[lvl];
    }
  }

  return equipmentLimitByLevel[sortedLevels[sortedLevels.length - 1]];
}
