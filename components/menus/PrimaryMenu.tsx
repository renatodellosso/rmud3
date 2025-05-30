import { GameState } from "lib/types/types";
import PrimaryActionBar from "./PrimaryActionBar";
import useActionBar from "lib/hooks/useActionBar";

export default function PrimaryMenu({ gameState }: { gameState: GameState }) {
  return (
    <div className="grow flex flex-col">
      <div className="grow flex flex-col">
        {gameState.messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <PrimaryActionBar gameState={gameState} />
    </div>
  );
}
