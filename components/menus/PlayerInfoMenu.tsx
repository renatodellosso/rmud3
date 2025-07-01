import statusEffects from "lib/gamedata/statusEffects";
import { getXpForNextLevel } from "lib/gamedata/levelling";
import { GameState } from "lib/types/types";
import AbilityScore from "lib/types/AbilityScore";
import { difficultyOptions } from "../../lib/types/Difficulty";
import DifficultyDescription from "../DifficultyDescription";
import StatusEffectList from "../StatusEffectList";

export default function PlayerInfoMenu({
  gameState: { self, guild },
}: {
  gameState: GameState;
}) {
  return (
    <div className="border w-1/5 flex flex-col gap-2">
      <h2 className="text-xl">{self.name}</h2>
      <div className="tooltip">
        Difficulty: {difficultyOptions[self.difficulty].name}
        <div className="tooltip-text w-48">
          <DifficultyDescription difficulty={self.difficulty} />
        </div>
      </div>
      <div>
        HP: {self.health.toFixed()}/{self.getMaxHealth().toFixed()}
      </div>
      <div>
        Level {self.level} - {self.xp.toLocaleString()}/
        {getXpForNextLevel(self.level).toLocaleString()} XP
      </div>
      <div>
        <strong>Guild:</strong> {guild ? guild.name : "None"}
      </div>
      <div>
        <strong>Ability Scores:</strong>
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
      <StatusEffectList effects={self.statusEffects} />
    </div>
  );
}
