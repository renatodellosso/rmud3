import { AbilityScore, GameState } from "lib/types/types";

export default function PlayerInfoMenu({
  gameState: { self },
}: {
  gameState: GameState;
}) {
  return (
    <div className="border w-1/5 flex flex-col gap-2">
      <h2 className="text-xl">{self.name}</h2>
      <div>
        HP: {self.health}/{self.getMaxHealth()}
      </div>
      <div>
        Ability Scores:
        <ul>
          {Object.entries(self.abilityScores).map(([ability, score]) => {
            const val = self.getAbilityScore(ability as AbilityScore);

            return (
              <li key={ability}>
                {ability}: {val} ({self.abilityScores[ability as AbilityScore]}{" "}
                base + {val - self.abilityScores[ability as AbilityScore]}{" "}
                bonus)
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
