import entities from "lib/gamedata/entities";
import Difficulty, { difficultyOptions } from "lib/types/Difficulty";
import { CreatureDefinition } from "lib/types/entities/creature";

export default function DifficultyDescription({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const options = difficultyOptions[difficulty];

  return (
    <div>
      <strong>{options.name}</strong>
      <div>{options.description}</div>
      <div>
        <p>Base Health Multiplier: x{options.baseHealthMultiplier}</p>
        {options.healthBonusFromConstitution && (
          <p>
            Health Bonus per Constitution: {options.healthBonusFromConstitution}
          </p>
        )}
        <p>On Death: {options.inventoryHandlingOnDeath}</p>
      </div>
    </div>
  );
}
