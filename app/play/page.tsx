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
import React, { useEffect } from "react";
import { SnowOverlay } from "react-snow-overlay";
import ReforgeMenu from "@/components/menus/ReforgeMenu";
import PrimaryActionBar from "@/components/menus/PrimaryActionBar";
import HeaderBar from "@/components/HeaderBar";
import Menu from "lib/types/Menu";
import ChatMenu from "@/components/menus/ChatMenu";
import { socket } from "lib/socket";
import { ExitData } from "lib/types/types";
import useKeybind from "lib/hooks/useKeybind";

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

  useEffect(() => {
    function moveOnKeydown(event: KeyboardEvent) {
      if (!gameState)
        return () => {
          document.removeEventListener("keydown", moveOnKeydown, true);
        };

      let exit = undefined;

      if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        exit = gameState!.location.exits.find((e) => {
          const direction = gameState!.map.getDirection(
            gameState!.location.id,
            e.id
          );
          if (direction && direction[1] > 0) return true;
        });
      } else if (
        event.key === "ArrowUp" ||
        event.key === "w" ||
        event.key === "W"
      ) {
        exit = gameState!.location.exits.find((e) => {
          const direction = gameState!.map.getDirection(
            gameState!.location.id,
            e.id
          );
          if (direction && direction[1] < 0) return true;
        });
      } else if (
        event.key === "ArrowLeft" ||
        event.key === "a" ||
        event.key === "A"
      ) {
        exit = gameState!.location.exits.find((e) => {
          const direction = gameState!.map.getDirection(
            gameState!.location.id,
            e.id
          );
          if (direction && direction[2] < 0) return true;
        });
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        exit = gameState!.location.exits.find((e) => {
          const direction = gameState!.map.getDirection(
            gameState!.location.id,
            e.id
          );
          if (direction && direction[2] > 0) return true;
        });
      } else if (event.key === "q" || event.key === "Q") {
        exit = gameState!.location.exits.find((e) => {
          const direction = gameState!.map.getDirection(
            gameState!.location.id,
            e.id
          );
          if (direction && direction[0] < 0) return true;
        });
      } else if (event.key === "e" || event.key === "E") {
        exit = gameState!.location.exits.find((e) => {
          const direction = gameState!.map.getDirection(
            gameState!.location.id,
            e.id
          );
          if (direction && direction[0] > 0) return true;
        });
      }

      if (exit) {
        socket.emit("move", exit.id);
      }
    }

    document.addEventListener("keydown", moveOnKeydown, true);

    return () => {
      document.removeEventListener("keydown", moveOnKeydown, true);
    };
  }, [gameState]);

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
        {openMenus.includes(Menu.Chat) && <ChatMenu gameState={gameState} />}
        {gameState.interactions
          .filter((i) => i.type !== "logOnly")
          .map((interaction, index) =>
            interaction.type === "crafting" ? (
              <CraftingMenu
                key={index}
                inventory={gameState.self.getCraftingInventory()}
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
