import { io, Socket } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000";

let s = (globalThis as any as { socket: Socket | undefined }).socket;
if (!s) {
  s = io(URL);

  (globalThis as any as { socket: Socket | undefined }).socket = s;
}

export const socket = s;
