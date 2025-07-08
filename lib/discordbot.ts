import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import getPlayerManager from "./PlayerManager";

export function startDiscordBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("ready", () => {
    console.log(`> Discord bot logged in as ${client.user?.tag}`);

    updateStatus(client);

    setInterval(() => {
      updateStatus(client);
    }, 15 * 1000);
  });

  client.login(process.env.DISCORD_BOT_SECRET);
}

function updateStatus(client: Client) {
  const playerManager = getPlayerManager();

  client.user?.setPresence({
    status: "online",
    activities: [
      {
        name: `w/ ${playerManager.countOnlinePlayers()} players @ REDACTED`,
        type: ActivityType.Playing,
      },
    ],
  });
}
