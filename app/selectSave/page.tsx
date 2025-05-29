"use client";

import { socket } from "lib/socket";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EJSON } from "bson";
import { PlayerSave, SerializedEJSON } from "lib/types/types";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";

function PlayerSaveCard({ save }: { save: PlayerSave }) {
  function selectSave() {
    socket.emit("selectSave", save.progress._id.toString());
    location.href = "/play";
  }

  return (
    <button onClick={selectSave} className="w-full">
      Save: {save.instance.name}
    </button>
  );
}

export default function SelectSave() {
  useRedirectIfSessionIdIsNotPresent();
  const [saves, setSaves] = useState<PlayerSave[]>([]);

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      window.location.href = "/signin";
      return;
    }

    socket.emit("setSessionId", sessionId, (success: boolean) => {
      if (!success) {
        console.error("Failed to set session ID");
        localStorage.removeItem("sessionId");
        window.location.href = "/signin";
      }
    });

    socket.emit("getSaves", (saves: SerializedEJSON<PlayerSave[]>) => {
      setSaves(EJSON.parse(saves));
    });
  }, []);

  function createNewSave() {
    socket.emit("createNewSave");
    location.href = "/play";
  }

  return (
    <div className="h-screen flex flex-col">
      <Link href="/" className="text-3xl text-white font-bold">
        RMUD3
      </Link>
      <div className="grow flex flex-col justify-center items-center">
        <h1 className="text-xl text-center">Select a save:</h1>
        <div className="w-1/4 flex flex-col items-center mt-4 gap-2">
          {saves.map((save) => (
            <PlayerSaveCard key={save.instance._id.toString()} save={save} />
          ))}
          <button onClick={createNewSave} className="w-full mt-6">
            New Save
          </button>
        </div>
      </div>
    </div>
  );
}
