import { useState, useEffect } from "react";
import { socket } from "lib/socket";

export function useFooEvents() {
  const [fooEvents, setFooEvents] = useState<any[]>([]);

  useEffect(() => {
    function onFooEvent(value: any) {
      setFooEvents((previous) => [...previous, value]);
    }

    socket.on("fooEvent", onFooEvent);

    return () => {
      socket.off("fooEvent", onFooEvent);
    };
  }, []);

  return fooEvents;
}
