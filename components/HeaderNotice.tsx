import { GameState } from "lib/types/types";
import { useEffect, useState } from "react";
import ItemTooltip from "./ItemTooltip";
import { ItemId } from "lib/gamedata/items";
import { ItemInstance } from "lib/types/item";
import ItemInputList from "./ItemInputList";
import ItemOutputList from "./ItemOutputList";

export default function HeaderNotice({ gameState }: { gameState: GameState }) {
  const rotation: ("dungeonRegen" | "pinnedRecipe")[] = [
    "dungeonRegen",
    "pinnedRecipe",
  ];
  const [displayed, setDisplayed] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayed((prev) => (prev + 1) % rotation.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const recipe = gameState.self.pinnedRecipe;
  if (displayed === 1 && recipe) {
    return (
      <div>
        <ItemInputList
          items={recipe.input}
          inventory={gameState.self.getCraftingInventory()}
          self={gameState.self}
        />{" "}
        =&gt;{" "}
        <span
          className={
            recipe.hasInput(gameState.self.getCraftingInventory())
              ? ""
              : "text-red-500"
          }
        >
          <ItemOutputList
            items={recipe.output}
            inventory={gameState.self.getCraftingInventory()}
            self={gameState.self}
          />
        </span>
      </div>
    );
  }

  return (
    <div>
      Dungeon regenerates in{" "}
      {gameState.minutesTillDungeonRegeneration > 0
        ? `${gameState.minutesTillDungeonRegeneration} minutes`
        : "now!"}
    </div>
  );
}
