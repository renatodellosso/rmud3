"use client";

import PlayerInfoMenu from "@/components/menus/PlayerInfoMenu";
import PrimaryMenu from "@/components/menus/PrimaryMenu";
import useGameState from "lib/hooks/useGameState";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";
import { GameState } from "lib/types/types";
import React, { ReactNode } from "react";

const menus: Record<string, (props: { gameState: GameState }) => ReactNode> = {
  "Player Info": PlayerInfoMenu,
};

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

  const [openMenus, setOpenMenus] = React.useState<(keyof typeof menus)[]>([]);

  function toggleMenu(menuName: keyof typeof menus) {
    if (openMenus.includes(menuName)) {
      setOpenMenus(openMenus.filter((name) => name !== menuName));
    } else {
      setOpenMenus([...openMenus, menuName]);
    }
  }

  if (!gameState) {
    return <LoadingGameState />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="w-full flex border-b border-white">
        {Object.keys(menus).map((menuName) => (
          <button
            onClick={() => toggleMenu(menuName as keyof typeof menus)}
            key={menuName}
            className="px-1"
          >
            {menuName}
          </button>
        ))}
      </div>
      <div className="flex flex-row grow">
        <PrimaryMenu gameState={gameState} />
        {openMenus.map((menu) => menus[menu]({ gameState }))}
      </div>
    </div>
  );
}
