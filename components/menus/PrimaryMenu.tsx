import { GameState } from "lib/types/types";
import PrimaryActionBar from "./PrimaryActionBar";

export default function PrimaryMenu({ gameState }: { gameState: GameState }) {
  return (
    <div className="grow w-min flex flex-col-reverse h-full overflow-y-scroll">
      {gameState.messages.toReversed().map((msg, index) => (
        <div key={index}>{msg.split("\n").map((line, i) => <div key={i}>{line}</div>)}</div>
      ))}
    </div>
  );
}
