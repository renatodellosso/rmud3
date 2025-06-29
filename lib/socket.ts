import { io, Socket } from "socket.io-client";
import { getSingleton } from "./utils";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./types/socketiotypes";

// "undefined" means the URL will be computed from the `window.location` object
const URL = undefined;
// process.env.NODE_ENV === "production"
//   ? undefined
//   : "http://localhost:3000";

export const socket = getSingleton<
  Socket<ServerToClientEvents, ClientToServerEvents>
>("socket", () => io(URL))!;
