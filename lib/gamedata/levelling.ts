export function getXpForNextLevel(level: number): number {
  if (level < 1) {
    return 100;
  }
  return Math.round(100 * Math.pow(1.1, level) + getXpForNextLevel(level - 1));
}

export const equipmentLimitByLevel: Record<number, number> = {
  1: 2,
  3: 3,
  5: 4,
  15: 5,
  30: 6,
  60: 7,
  100: 8,
};

export function getEquipmentLimitForLevel(level: number): number {
  const sortedLevels = Object.entries(equipmentLimitByLevel)
    .map(([k, v]) => [Number(k), v])
    .sort(([a], [b]) => a - b);

  for (const lvl of sortedLevels) {
    if (level < lvl[0]) {
      return lvl[1];
    }
  }

  return sortedLevels[sortedLevels.length - 1][1];
}
