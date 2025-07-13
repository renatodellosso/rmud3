import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
} from "discord.js";
import getPlayerManager from "../PlayerManager";
import commands from "./commands";

export function startDiscordBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("ready", () => {
    console.log(`> Discord bot logged in as ${client.user?.tag}`);

    updateStatus(client);

    registerCommands(client);

    setInterval(() => {
      updateStatus(client);
    }, 15 * 1000);
  });

  client.on(Events.InteractionCreate, handleCommandInteraction);

  client.login(process.env.DISCORD_BOT_SECRET);
}

function updateStatus(client: Client) {
  const playerManager = getPlayerManager();

  client.user?.setPresence({
    status: "online",
    activities: [
      {
        name: `w/ ${playerManager.countOnlinePlayers()} players @ rmud3.com`,
        type: ActivityType.Playing,
      },
    ],
  });
}

function registerCommands(client: Client) {
  for (const command of Object.values(commands)) {
    client.application?.commands
      .create(command.builder.toJSON())
      .then(() => console.log(`Registered command: ${command.builder.name}`))
      .catch(console.error);
  }
}

function handleCommandInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  console.log(
    `Received interaction: ${interaction.commandName} from ${interaction.user.tag}`
  );

  const command = commands[interaction.commandName];
  if (!command) {
    console.error(`Unknown command: ${interaction.commandName}`);
    return;
  }

  command.handler(interaction).catch((error) => {
    console.error(`Error handling command ${interaction.commandName}:`, error);
    interaction.reply({
      content: "There was an error while executing this command.",
      ephemeral: true,
    });
  });
}
