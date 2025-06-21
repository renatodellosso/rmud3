import statusEffects from "lib/gamedata/statusEffects";
import XpForNextLevel from "lib/gamedata/XpForNextLevel";
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
        Level {self.level} - {self.xp.toLocaleString()}/
        {XpForNextLevel[self.level].toLocaleString()} XP
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
      <div>
        Status Effects:
        <ul>
          {self.statusEffects.map((effect) => (
            <li key={effect.definitionId}>
              {statusEffects[effect.definitionId].name} -{" "}
              {statusEffects[effect.definitionId].description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
