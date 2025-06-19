import { socket } from "lib/socket";
import { GameState } from "lib/types/types";
import { useEffect, useState } from "react";

export enum ActionState {
  Base = "base",
  Move = "move",
  Interact = "interact",
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

    const logOnlyInteraction = gameState.interactions.find(
      (i) => i.type === "logOnly"
    );
    if (logOnlyInteraction) {
      setActions(
        logOnlyInteraction.actions!.map((action) => ({
          text: action.text,
          action: () =>
            socket.emit(
              "interact",
              logOnlyInteraction.entityId.toString(),
              action.id
            ),
        }))
      );

      return;
    }

    switch (actionState) {
      case ActionState.Base:
        if (gameState.location.exits.length) {
          newActions.push({
            text: "Move",
            action: () => setActionState(ActionState.Move),
          });
        }

        const interactableEntities = gameState.location.entities.filter(
          (entity) =>
            entity.interactable &&
            !gameState.interactions.find(
              (i) => i.entityId.toString() === entity._id.toString()
            )
        );

        if (interactableEntities.length) {
          newActions.push({
            text: "Interact",
            action: () => setActionState(ActionState.Interact),
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

      case ActionState.Interact:
        newActions.push(backToBaseAction);

        gameState.location.entities
          .filter((entity) => entity.interactable)
          .forEach((entity) => {
            newActions.push({
              text: entity.name,
              action: () => {
                socket.emit("startInteraction", entity._id.toString());
                setActionState(ActionState.Base); // Reset action state so they will be at the base when interaction is over
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
