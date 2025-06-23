export const xpForNextLevel: number[] = [
  100, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
];

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
