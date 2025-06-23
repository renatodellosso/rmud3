import Difficulty, { difficultyOptions } from "lib/types/Difficulty";

export default function DifficultyDescription({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const options = difficultyOptions[difficulty];

  return (
    <div className="difficulty-description">
      <strong>{options.name}</strong>
      <div>{options.description}</div>
      <div>
        {options.baseHealth && <p>Base Health: {options.baseHealth}</p>}
        {options.healthBonusFromConstitution && (
          <p>
            Health Bonus from Constitution:{" "}
            {options.healthBonusFromConstitution}
          </p>
        )}
        <p>On Death: {options.inventoryHandlingOnDeath}</p>
      </div>
    </div>
  );
}
