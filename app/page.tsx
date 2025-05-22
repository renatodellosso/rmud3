"use client";

import React, { useState, useEffect } from "react";
import { socket } from "lib/socket";
import { ConnectionState } from "components/ConnectionState";
import { ConnectionManager } from "components/ConnectionManager";
import { Events } from "components/Events";
import { MyForm } from "components/MyForm";

export default function Page() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState<any[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: any) {
      setFooEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("fooEvent", onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("fooEvent", onFooEvent);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col h-screen justify-between">
        <div>
          <h1 className="text-3xl text-white font-bold">RMUD3</h1>
        </div>
        <div>
          <button
            type="button"
            className="bg-black hover:bg-gray-600 border-1 border-white text-white py-1 px-2"
          >
            Sign In
          </button>
          <button
            type="button"
            className="bg-black hover:bg-gray-600 border-1 border-white text-white py-1 px-2"
          >
            Create Account
          </button>
        </div>
      </div>
      <div className="App">
        <ConnectionState isConnected={isConnected} />
        <Events events={fooEvents} />
        <ConnectionManager />
        <MyForm />
      </div>
    </div>
  );
}
