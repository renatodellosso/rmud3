"use client";

import { socket } from "lib/socket";
import Link from "next/link";
import { useEffect } from "react";

export default function Play() {
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
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Link href="/" className="text-3xl text-white font-bold">
        RMUD3
      </Link>
      <div className="grow flex flex-col justify-center items-center">
        <h1 className="text-xl w-full text-center">Welcome to RMUD3!</h1>
        <p className="text-white">This is the play page.</p>
      </div>
    </div>
  );
}
