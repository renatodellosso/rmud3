import { socket } from "lib/socket";
import { GameState } from "lib/types/types";
import { useEffect, useState } from "react";

export enum ActionState {
  Base = "base",
  Move = "move",
}

export type Action = {
  text: string;
  action: () => void;
};

export default function useActionBar(gameState: GameState) {
  const [actionState, setActionState] = useState<ActionState>(ActionState.Base);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    const newActions: Action[] = [];

    const backToBaseAction: Action = {
      text: "Back",
      action: () => setActionState(ActionState.Base),
    };

    switch (actionState) {
      case ActionState.Base:
        if (gameState.location.exits.length) {
          newActions.push({
            text: "Move",
            action: () => setActionState(ActionState.Move),
          });
        }
        break;

      case ActionState.Move:
        newActions.push(backToBaseAction);

        gameState.location.exits.forEach((exit) => {
          newActions.push({
            text: `Go to ${exit.name}`,
            action: () => {
              socket.emit("move", exit.id);

              // Reset action state after moving
              setActionState(ActionState.Base);
            },
          });
        });
        break;

      default:
        console.warn("Unknown action state:", actionState);
    }

    setActions(newActions);
  }, [gameState, actionState]);

  return actions;
}
