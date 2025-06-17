import { socket } from "lib/socket";
import { GameState, SerializedEJSON } from "lib/types/types";
import { useEffect, useState } from "react";
import { EJSON } from "bson";
import { restoreFieldsAndMethods } from "lib/utils";
import { PlayerInstance } from "lib/types/player";
import { CreatureInstance } from "lib/types/creature";
import { isTargetACreature } from "lib/gamedata/CanTarget";
import { EntityInstance } from "lib/types/entity";
import { CreatureId } from "lib/gamedata/entities";

export default function useGameState(): GameState | undefined {
  const [gameState, setGameState] = useState<GameState>();

  useEffect(() => {
    console.log("Socket ID:", socket.id);

    socket.onAny((eventName: string, ...args: any[]) => {
      console.log(`Received event: ${eventName}`, args);
    });

    socket.on("setGameState", (newGameState: SerializedEJSON<GameState>) => {
      const parsedGameState: GameState = EJSON.parse(newGameState);

      restoreFieldsAndMethods(parsedGameState.self, new PlayerInstance());
      for (const creature of parsedGameState.location.entities) {
        restoreFieldsAndMethods(
          creature,
          creature.definitionId === "player"
            ? new PlayerInstance()
            : isTargetACreature(parsedGameState.self, creature)
            ? new CreatureInstance(creature.definitionId as CreatureId)
            : new EntityInstance(creature.definitionId)
        );
      }

      console.log("Received game state:", parsedGameState);
      setGameState(parsedGameState);
    });

    socket.on("addMessage", (message: string) => {
      console.log("Received new message:", message);

      // Append the new message to the existing messages
      setGameState((prevState) => {
        if (!prevState) {
          console.error("Game state is not initialized.");
          return undefined;
        }
        return {
          ...prevState,
          messages: [...prevState!.messages, message],
        };
      });
    });

    return () => {
      socket.off("setGameState");
      socket.off("addMessage");
      socket.offAny();
    };
  });

  useEffect(() => {
    socket.emit(
      "setSessionId",
      localStorage.getItem("sessionId")!,
      (success: boolean) => {
        if (!success) {
          console.error("Failed to set session ID");
          localStorage.removeItem("sessionId");
          window.location.href = "/signin";
          return;
        }

        socket.emit("requestGameState");
      }
    );
  }, [socket]);

  return gameState;
}
