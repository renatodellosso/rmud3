import useActionBar from "lib/hooks/useActionBar";
import { GameState } from "lib/types/types";
import { act } from "react-dom/test-utils";

export default function PrimaryActionBar({
  gameState,
}: {
  gameState: GameState;
}) {
  const actions = useActionBar(gameState);

  return (
    <div className="border-t flex">
      {actions.map((action, index) => (
        <button
          key={index}
          className="grow px-2 py-1"
          onClick={() => {
            action.action();
          }}
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}
