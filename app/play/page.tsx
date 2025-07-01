"use client";

import CombatMenu from "@/components/menus/CombatMenu";
import ContainerMenu from "@/components/menus/ContainerMenu";
import CraftingMenu from "@/components/menus/CraftingMenu";
import GuildMenu from "@/components/menus/GuildMenu";
import InventoryMenu from "@/components/menus/InventoryMenu";
import LocationMenu from "@/components/menus/LocationMenu";
import MapMenu from "@/components/menus/MapMenu";
import PlayerInfoMenu from "@/components/menus/PlayerInfoMenu";
import PrimaryMenu from "@/components/menus/PrimaryMenu";
import useAnimations from "lib/hooks/useAnimations";
import useGameState from "lib/hooks/useGameState";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";
import React from "react";
import { SnowOverlay } from "react-snow-overlay";
import ReforgeMenu from "@/components/menus/ReforgeMenu";
import { getXpForNextLevel } from "lib/gamedata/levelling";
import PrimaryActionBar from "@/components/menus/PrimaryActionBar";
import HeaderBar from "@/components/HeaderBar";

export enum Menu {
  PlayerInfo = "Player Info",
  Combat = "Combat",
  Location = "Location",
  Inventory = "Inventory & Equipment",
  Map = "Map",
  Guild = "Guild",
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
      {gameState.self.health < 0.2 * gameState.self.getMaxHealth() && (
        <SnowOverlay
          color="rgba(255, 0, 0, 0.5)"
          disabledOnSingleCpuDevices={true}
        />
      )}
      <HeaderBar gameState={gameState} toggleMenu={toggleMenu} />
      <div className="flex h-11/12">
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
        {openMenus.includes(Menu.Map) && (
          <MapMenu
            map={gameState.map}
            currentLocation={gameState.self.location}
          />
        )}
        {gameState.guild && openMenus.includes(Menu.Guild) && (
          <GuildMenu self={gameState.self} guild={gameState.guild} />
        )}
        {gameState.interactions
          .filter((i) => i.type !== "logOnly")
          .map((interaction, index) =>
            interaction.type === "crafting" ? (
              <CraftingMenu
                key={index}
                inventory={gameState.self.inventory}
                interaction={interaction}
                self={gameState.self}
              />
            ) : interaction.type === "container" ? (
              <ContainerMenu
                key={index}
                interaction={interaction}
                self={gameState.self}
              />
            ) : interaction.type === "reforge" ? (
              <ReforgeMenu
                key={index}
                interaction={interaction}
                self={gameState.self}
              />
            ) : (
              <></>
            )
          )}
      </div>
      <div className="flex h-1/20">
        <PrimaryActionBar gameState={gameState} className="w-full" />
      </div>
    </div>
  );
}
