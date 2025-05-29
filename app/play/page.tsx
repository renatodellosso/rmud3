"use client";

import useGameState from "lib/hooks/useGameState";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";

export default function Play() {
  useRedirectIfSessionIdIsNotPresent();
  const gameState = useGameState();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {gameState ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game State</h1>
          <pre className="bg-gray-100 p-4 rounded-lg">
            {JSON.stringify(gameState, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-lg">Loading game state...</p>
      )}
    </div>
  );
}
