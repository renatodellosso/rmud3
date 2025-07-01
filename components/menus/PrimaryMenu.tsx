import { GameState } from "lib/types/types";
import PrimaryActionBar from "./PrimaryActionBar";

export default function PrimaryMenu({ gameState }: { gameState: GameState }) {
  return (
    <div className="grow w-min">
      <div className="flex flex-col-reverse h-19/20 overflow-y-scroll">
        {gameState.messages.toReversed().map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <PrimaryActionBar gameState={gameState} className="h-1/20" />
    </div>
  );
}
