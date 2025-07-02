import { Menu } from "app/play/page";
import { getXpForNextLevel } from "lib/gamedata/levelling";
import { GameState } from "lib/types/types";

export default function HeaderBar({
  gameState,
  toggleMenu,
}: {
  gameState: GameState;
  toggleMenu: (menu: Menu) => void;
}) {
  return (
    <div className="flex justify-between h-1/30 border-b border-white">
      <div className="flex">
        {Object.values(Menu)
          .filter((name) => name != Menu.Guild || gameState.guild)
          .map((name) => (
            <button
              onClick={() => toggleMenu(name)}
              key={name}
              className="px-1"
            >
              {name}
            </button>
          ))}
      </div>
      <div className="flex gap-2">
        {gameState.self.abilityScoreIncreases ? (
          <p className="text-right">
            {gameState.self.abilityScoreIncreases} unspent ASIs!
          </p>
        ) : (
          <></>
        )}
        <p className="text-right">
          Level {gameState.self.level} -{" "}
          {Math.round(gameState.self.xp).toLocaleString()}/
          {getXpForNextLevel(gameState.self.level).toLocaleString()} XP
        </p>
        <progress
          value={
            gameState.self.xp -
            (gameState.self.level > 0
              ? getXpForNextLevel(gameState.self.level - 1)
              : 0)
          }
          max={
            getXpForNextLevel(gameState.self.level) -
            (gameState.self.level > 0
              ? getXpForNextLevel(gameState.self.level - 1)
              : 0)
          }
          className="h-full border"
        />
      </div>
    </div>
  );
}
