"use client";

import { socket } from "lib/socket";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EJSON } from "bson";
import { PlayerSave, SerializedEJSON } from "lib/types/types";
import Difficulty, { difficultyOptions } from "lib/types/Difficulty";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";

function PlayerSaveCard({ save }: { save: PlayerSave }) {
  function selectSave() {
    socket.emit("selectSave", save.progress._id.toString());
    location.href = "/play";
  }

  return (
    <button onClick={selectSave} className="w-full">
      {save.instance.saveName} (
      {difficultyOptions[save.instance.difficulty]?.name})
    </button>
  );
}

export default function SelectSave() {
  useRedirectIfSessionIdIsNotPresent();
  const [saves, setSaves] = useState<PlayerSave[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(Difficulty.Normal);
  const [error, setError] = useState("");

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
    if (typeof saveName !== "string") {
      setError("Save name must be a string");
      return;
    }

    setSubmitting(true);
    setError("");

    socket.emit("createNewSave", saveName, selectedDifficulty);
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
          <input
            type="text"
            name="save name"
            placeholder="New Save Name"
            disabled={submitting}
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="w-full mt-6"
          />
          <div className="flex w-full gap-2">
            <div>Difficulty:</div>
            {Object.values(Difficulty).map((difficulty) => (
              <button
                key={difficulty}
                disabled={selectedDifficulty == difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className="px-1"
              >
                {difficultyOptions[difficulty].name}
              </button>
            ))}
          </div>
          <div>{difficultyOptions[selectedDifficulty].description}</div>
          <button onClick={createNewSave} className="w-full">
            Create New Save
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
