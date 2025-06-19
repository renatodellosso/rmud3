"use client";

import CombatMenu from "@/components/menus/CombatMenu";
import ContainerMenu from "@/components/menus/ContainerMenu";
import CraftingMenu from "@/components/menus/CraftingMenu";
import InventoryMenu from "@/components/menus/InventoryMenu";
import LocationMenu from "@/components/menus/LocationMenu";
import PlayerInfoMenu from "@/components/menus/PlayerInfoMenu";
import PrimaryMenu from "@/components/menus/PrimaryMenu";
import useAnimations from "lib/hooks/useAnimations";
import useGameState from "lib/hooks/useGameState";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";
import React from "react";

enum Menu {
  PlayerInfo = "Player Info",
  Combat = "Combat",
  Location = "Location",
  Inventory = "Inventory & Equipment",
}

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
  useAnimations();

  const [openMenus, setOpenMenus] = React.useState<Menu[]>([]);

  function toggleMenu(menuName: Menu) {
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
    <div className="h-screen w-screen overflow-hidden">
      <div className="h-1/30 w-full flex border-b border-white">
        {Object.values(Menu).map((name) => (
          <button onClick={() => toggleMenu(name)} key={name} className="px-1">
            {name}
          </button>
        ))}
      </div>
      <div className="flex flex-row h-29/30">
        <PrimaryMenu gameState={gameState} />
        {openMenus.includes(Menu.PlayerInfo) && (
          <PlayerInfoMenu gameState={gameState} />
        )}
        {openMenus.includes(Menu.Combat) && (
          <CombatMenu gameState={gameState} />
        )}
        {openMenus.includes(Menu.Location) && (
          <LocationMenu gameState={gameState} />
        )}
        {openMenus.includes(Menu.Inventory) && (
          <InventoryMenu self={gameState.self} />
        )}
        {gameState.interactions
          .filter((i) => i.type !== "logOnly")
          .map((interaction, index) =>
            interaction.type === "crafting" ? (
              <CraftingMenu
                key={index}
                inventory={gameState.self.inventory}
                interaction={interaction}
              />
            ) : (
              interaction.type === "container" ? (
                <ContainerMenu
                  key={index}
                  interaction={interaction}
                />
              ) : (
                <></>
              )
            )
          )}
      </div>
    </div>
  );
}
