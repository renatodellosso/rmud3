import useActionBar from "lib/hooks/useActionBar";
import { GameState } from "lib/types/types";

export default function PrimaryActionBar({
  gameState,
  className,
}: {
  gameState: GameState;
  className?: string;
}) {
  const actions = useActionBar(gameState);

  return (
    <div className={`border-t flex ${className}`}>
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
