"use client";

import { ConnectionState } from "components/ConnectionState";
import { ConnectionManager } from "components/ConnectionManager";
import { Events } from "components/Events";
import { MyForm } from "components/MyForm";
import { useFooEvents } from "lib/hooks/useFooEvents";
import { useIsConnected } from "lib/hooks/useIsConnected";

export default function Page() {
  const isConnected = useIsConnected();
  const fooEvents = useFooEvents();

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
