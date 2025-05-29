"use client";

import PrimaryMenu from "@/components/menus/PrimaryMenu";
import useGameState from "lib/hooks/useGameState";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";

function LoadingGameState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Loading game state...</p>
    </div>
  );
}

export default function Play() {
  useRedirectIfSessionIdIsNotPresent();
  const gameState = useGameState();

  if (!gameState) {
    return <LoadingGameState />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <PrimaryMenu gameState={gameState} />
    </div>
  );
}
