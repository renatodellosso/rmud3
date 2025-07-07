import { socket } from "lib/socket";
import { useEffect, useState } from "react";

export default function LatencyDisplay() {
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const start = Date.now();
      socket.emit("ping", () => {
        const end = Date.now();

        console.log(`Latency: ${end - start}ms`);
        setLatency(end - start);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>Latency: {latency}ms</div>;
}
