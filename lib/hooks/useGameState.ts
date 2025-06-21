import { socket } from "lib/socket";
import { GameState, SerializedEJSON } from "lib/types/types";
import { useEffect, useState } from "react";
import { EJSON } from "bson";
import { restoreFieldsAndMethods } from "lib/utils";
import { PlayerInstance } from "lib/types/entities/player";
import { CreatureInstance } from "lib/types/entities/creature";
import { isTargetACreature } from "lib/gamedata/CanTarget";
import { EntityInstance } from "lib/types/entity";
import { CreatureId } from "lib/gamedata/entities";
import Recipe from "lib/types/Recipe";
import LocationMap from "lib/types/LocationMap";

export default function useGameState(): GameState | undefined {
  const [gameState, setGameState] = useState<GameState>();

  // Log the socket ID and set up event listeners
  useEffect(() => {
    console.log("Socket ID:", socket.id);

    socket.onAny((eventName: string, ...args: any[]) => {
      console.log(`Received event: ${eventName}`, args);
    });

    socket.on("setGameState", (newGameState: SerializedEJSON<GameState>) => {
      const parsedGameState: GameState = EJSON.parse(newGameState);

      restoreMethods(parsedGameState);

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

  // Set the session ID and request the game state
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

function restoreMethods(gameState: GameState) {
  restoreFieldsAndMethods(gameState.map, new LocationMap());

  restoreFieldsAndMethods(gameState.self, new PlayerInstance());
  for (const creature of gameState.location.entities) {
    restoreFieldsAndMethods(
      creature,
      creature.definitionId === "player"
        ? new PlayerInstance()
        : isTargetACreature(gameState.self, creature)
        ? new CreatureInstance(creature.definitionId as CreatureId)
        : new EntityInstance(creature.definitionId)
    );
  }

  for (const interaction of gameState.interactions) {
    if (interaction.recipes) {
      for (const recipe of interaction.recipes) {
        restoreFieldsAndMethods(recipe, new Recipe({}, []));
      }
    }
  }
}
