import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import dotenv from "dotenv";
import registerServerListeners from "lib/registerServerListeners";
import { getSingleton } from "lib/utils";
import generateDungeon from "lib/dungeongeneration/generateDungeon";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "lib/types/socketiotypes";

dotenv.config();

const nextPort = parseInt(process.env.PORT || "3000", 10);
const socketPort = parseInt(process.env.SOCKET_PORT || "4000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, turbopack: dev });
const handle = app.getRequestHandler();

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: "http://localhost:3000",
  },
});

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(nextPort);

  console.log(
    `> Next.js Server listening at http://localhost:${nextPort} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
});

registerServerListeners(io);

io.listen(socketPort);
console.log(`> Socket.io server listening at http://localhost:${socketPort}`);

getSingleton("dungeon", () => {
  const dungeon = generateDungeon();
  console.log("Generated dungeon!");
  return dungeon;
});
