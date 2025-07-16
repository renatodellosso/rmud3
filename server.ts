import { createServer, Server } from "http";
import { parse } from "url";
import next from "next";
import dotenv from "dotenv";
import registerListeners from "lib/socketlisteners/registerListeners";
import { getSingleton } from "lib/utils";
import { TypedServer } from "./lib/types/socketioserverutils";
import { setupLocations } from "lib/startup";
import { startTicking } from "lib/TickManager";
import { startDiscordBot } from "lib/discord/discordbot";
import { generateDailyQuests } from "lib/questutils";

dotenv.config();

const nextPort = parseInt(process.env.PORT || "3000", 10);
const socketPort = parseInt(process.env.SOCKET_PORT || "4000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, turbopack: dev });
const handle = app.getRequestHandler();

function startSocketIoServer(httpServer: Server) {
  const io = getSingleton(
    "io",
    () =>
      new TypedServer(httpServer, {
        connectionStateRecovery: {
          maxDisconnectionDuration: 10000, // 10 seconds
        },
      })
  )!;

  registerListeners(io);

  if (dev) io.listen(socketPort);
  else io.listen(httpServer);
  console.log(`> Socket.io server listening`);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  startSocketIoServer(httpServer);

  httpServer.listen(nextPort, () => {
    console.log(`> Next.js server listening at http://localhost:${nextPort}`);
  });
});

setupLocations();
generateDailyQuests();
startTicking();

if (!dev || process.env.START_DISCORD_BOT) startDiscordBot();
