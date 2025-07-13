import { SlashCommandBuilder } from "discord.js";
import Command from "./types";
import { getMongoClient } from "lib/getMongoClient";
import CollectionId from "lib/types/CollectionId";
import Guild from "lib/types/Guild";
import { PlayerInstance } from "lib/types/entities/player";

const commandArray: Command[] = [
  {
    builder: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!"),
    handler: async (interaction) => {
      await interaction.reply("Pong!");
    },
  },
  {
    builder: new SlashCommandBuilder()
      .setName("leaderboard")
      .setDescription("Displays the leaderboard."),
    handler: async (interaction) => {
      const db = await getMongoClient();

      const topPlayers = (await db
        .collection(CollectionId.PlayerInstances)
        .find({}, { sort: { xp: -1 }, limit: 25 })
        .toArray()) as PlayerInstance[];

      const guildIds = topPlayers.map((player) => player.guildId);
      const guilds = (await db
        .collection(CollectionId.Guilds)
        .find({ id: { $in: guildIds } })
        .toArray()) as Guild[];

      const guildMap: { [id: string]: Guild } = {};
      for (const guild of guilds) {
        guildMap[guild._id.toString()] = guild;
      }

      let msg = "**RMUD3 Leaderboard**\n";

      for (let i = 0; i < topPlayers.length; i++) {
        const player = topPlayers[i];

        let row = `${i + 1}. ${player.name} - lvl ${
          player.level
        } / ${Math.round(player.xp).toLocaleString()} XP`;

        if (player.guildId) {
          const guild = guildMap[player.guildId.toString()];
          if (guild) {
            row += ` (${guild.name})`;
          }
        }

        msg += `${row}\n`;
      }

      await interaction.reply(msg);
    },
  },
  {
    builder: new SlashCommandBuilder()
      .setName("guild-leaderboard")
      .setDescription("Displays the guild leaderboard."),
    handler: async (interaction) => {
      const db = await getMongoClient();

      const topGuilds = (await db
        .collection(CollectionId.Guilds)
        .find({}, { sort: { xp: -1 }, limit: 25 })
        .toArray()) as Guild[];

      let msg = "**RMUD3 Guild Leaderboard**\n";

      for (let i = 0; i < topGuilds.length; i++) {
        const guild = topGuilds[i];
        msg += `${i + 1}. ${guild.name} - lvl ${guild.level} / ${Math.round(
          guild.xp
        ).toLocaleString()} XP (${guild.members.length} members)\n`;
      }

      await interaction.reply(msg);
    },
  },
];

const commands = commandArray.reduce((acc, command) => {
  acc[command.builder.name] = command;
  return acc;
}, {} as Record<string, Command>);

export default commands;
