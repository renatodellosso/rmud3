import { io, Socket } from "socket.io-client";
import { getSingleton } from "./utils";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000";

export const socket = getSingleton<Socket>("socket", () => io(URL));
