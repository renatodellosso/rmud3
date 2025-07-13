"use client";

import { socket } from "lib/socket";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EJSON, ObjectId } from "bson";
import { PlayerSave, SerializedEJSON } from "lib/types/types";
import Difficulty, { difficultyOptions } from "lib/types/Difficulty";
import useRedirectIfSessionIdIsNotPresent from "lib/hooks/useRedirectIfSessionIdIsNotPresent";
import DifficultyDescription from "@/components/DifficultyDescription";

function PlayerSaveCard({
  save,
  isPrimary,
}: {
  save: PlayerSave;
  isPrimary: boolean;
}) {
  function selectSave() {
    socket.emit("selectSave", save.progress._id.toString());
    location.href = "/play";
  }

  function deleteSave() {
    if (
      !confirm(
        `Are you sure you want to delete the save: ${save.instance.saveName} ${
          difficultyOptions[save.instance.difficulty]?.name
        }?`
      )
    ) {
      return;
    }

    socket.emit("deleteSave", save.progress._id.toString());
    location.reload();
  }

  function setPrimarySave() {
    if (isPrimary) {
      return;
    }

    socket.emit("setPrimarySave", save.instance._id.toString());
    location.reload();
  }

  return (
    <div className="flex justify-between gap-2 w-full">
      <button onClick={selectSave} className="w-3/4">
        {save.instance.saveName} (
        {difficultyOptions[save.instance.difficulty]?.name})
      </button>
      <button onClick={deleteSave} className="px-1 hover:bg-red-500!">
        Delete
      </button>
      <button
        onClick={setPrimarySave}
        disabled={isPrimary}
        className="px-1 tooltip"
      >
        {isPrimary ? "Selected" : "Set"} as Primary
        <div className="tooltip-text w-48">
          {isPrimary
            ? "This save is currently set as the primary save."
            : "Set this save as the one to use for Discord commands"}
        </div>
      </button>
    </div>
  );
}

export default function SelectSave() {
  useRedirectIfSessionIdIsNotPresent();
  const [saves, setSaves] = useState<PlayerSave[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    Difficulty.Normal
  );
  const [discordLinkCode, setDiscordLinkCode] = useState("Loading...");
  const [linkedDiscordAccount, setLinkedDiscordAccount] = useState(false);
  const [primarySaveId, setPrimarySaveId] = useState<ObjectId>();
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

    socket.emit(
      "getSaveSelectPageData",
      (
        saves: SerializedEJSON<PlayerSave[]>,
        discordLinkCode: string,
        linkedDiscordAccount: boolean,
        primarySaveId: string | undefined
      ) => {
        setSaves(EJSON.parse(saves));
        setDiscordLinkCode(discordLinkCode);
        setLinkedDiscordAccount(linkedDiscordAccount);
        setPrimarySaveId(
          primarySaveId ? new ObjectId(primarySaveId) : undefined
        );
      }
    );
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
      <div>
        <Link href="/" className="text-3xl text-white font-bold">
          RMUD3
        </Link>
        {linkedDiscordAccount ? (
          <div>Discord account linked successfully.</div>
        ) : (
          <div className="w-1/3">
            <span className="animate-pulse">NOTICE:</span> Link your Discord
            account by running the command{" "}
            <span className="font-mono">/link {discordLinkCode}</span> in the
            RMUD3 Discord server
          </div>
        )}
      </div>
      <div className="grow flex flex-col justify-center items-center">
        <h1 className="text-xl text-center">Select a save:</h1>
        <div className="w-1/2 flex flex-col items-center mt-4 gap-2">
          {saves.map((save) => (
            <PlayerSaveCard
              key={save.instance._id.toString()}
              save={save}
              isPrimary={primarySaveId?.equals(save.instance._id) || false}
            />
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
          <DifficultyDescription difficulty={selectedDifficulty} />
          <button onClick={createNewSave} className="w-full">
            Create New Save
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
