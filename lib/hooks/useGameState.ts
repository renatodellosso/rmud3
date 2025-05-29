import { socket } from "lib/socket";
import { GameState, SerializedEJSON } from "lib/types/types";
import { useEffect, useState } from "react";
import { EJSON } from "bson";

export default function useGameState(): GameState | undefined {
  const [gameState, setGameState] = useState<GameState>();

  useEffect(() => {
    socket.on("setGameState", (newGameState: SerializedEJSON<GameState>) => {
      const parsedGameState: GameState = EJSON.parse(newGameState);
      console.log("Received game state:", parsedGameState);
      setGameState(parsedGameState);
    });

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

    return () => {
      socket.off("setGameState");
    };
  });

  return gameState;
}
