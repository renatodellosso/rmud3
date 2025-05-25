import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import dotenv from "dotenv";
import registerServerListeners from "lib/registerServerListeners";

dotenv.config();

const nextPort = parseInt(process.env.PORT || "3000", 10);
const socketPort = parseInt(process.env.SOCKET_PORT || "4000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
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
