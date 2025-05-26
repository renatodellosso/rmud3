"use client";

import { socket } from "lib/socket";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EJSON, ObjectId } from "bson";
import { PlayerSave, SerializedEJSON } from "lib/types/types";

function PlayerSaveCard({ save }: { save: PlayerSave }) {
  return <button>{save.instance.name}</button>;
}

export default function SelectSave() {
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
  }

  return (
    <div className="h-screen flex flex-col">
      <Link href="/" className="text-3xl text-white font-bold">
        RMUD3
      </Link>
      <div className="grow flex flex-col justify-center items-center">
        <h1 className="text-xl text-center">Select a save:</h1>
        <div className="w-1/4 flex flex-col items-center mt-4">
          {saves.map((save) => (
            <PlayerSaveCard key={save.instance._id.toString()} save={save} />
          ))}
          <button onClick={createNewSave} className="grow">New Save</button>
        </div>
      </div>
    </div>
  );
}
