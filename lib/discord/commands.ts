import { Embed, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "./types";
import { getMongoClient } from "lib/getMongoClient";
import CollectionId from "lib/types/CollectionId";
import Guild from "lib/types/Guild";
import { PlayerInstance } from "lib/types/entities/player";
import { difficultyOptions } from "lib/types/Difficulty";
import Account from "lib/types/Account";

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

      async function getGuildsForPlayers(players: PlayerInstance[]) {
        const guildIds = topPlayers.map((player) => player.guildId);
        const guilds = (await db
          .collection(CollectionId.Guilds)
          .find({ id: { $in: guildIds } })
          .toArray()) as Guild[];

        const guildMap: { [id: string]: Guild } = {};
        for (const guild of guilds) {
          guildMap[guild._id.toString()] = guild;
        }

        return guildMap;
      }

      async function getAccountsForPlayers(players: PlayerInstance[]) {
        const accountNames = players.map((player) => player.name);
        const accounts = (await db
          .collection(CollectionId.Accounts)
          .find({ username: { $in: accountNames } })
          .toArray()) as Account[];
        const accountMap: { [username: string]: Account } = {};
        for (const account of accounts) {
          accountMap[account.username] = account;
        }
        return accountMap;
      }

      const [guildMap, accountMap] = await Promise.all([
        getGuildsForPlayers(topPlayers),
        getAccountsForPlayers(topPlayers),
      ]);

      let msg = "";

      for (let i = 0; i < topPlayers.length; i++) {
        const player = topPlayers[i];
        const account = accountMap[player.name];

        let row = `${i + 1}. ${player.name}${
          account?.discordUserId ? ` (<@${account.discordUserId}>)` : ""
        } - lvl ${player.level} / ${Math.round(player.xp).toLocaleString()} XP`;

        if (player.guildId) {
          const guild = guildMap[player.guildId.toString()];
          if (guild) {
            row += ` (${guild.name})`;
          }
        }

        const difficulty = difficultyOptions[player.difficulty].name;
        row += ` [${difficulty}]`;

        msg += `${row}\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle("RMUD3 Leaderboard")
        .setDescription(msg)
        .setColor("#0099ff");

      await interaction.reply({ embeds: [embed] });
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
  {
    builder: new SlashCommandBuilder()
      .setName("link")
      .setDescription("Links your Discord account.")
      .addStringOption((option) =>
        option
          .setName("code")
          .setDescription(
            "The code to link your Discord account. Find it on the save select page."
          )
          .setRequired(true)
      ) as SlashCommandBuilder,
    handler: async (interaction) => {
      const db = await getMongoClient();

      const code = interaction.options.getString("code");

      console.log(
        `Linking Discord account with code "${code}" for user ${interaction.user.globalName}`
      );

      if (!code) {
        await interaction.reply(
          "Please provide a code to link your Discord account."
        );
        return;
      }

      const account = await db.collection(CollectionId.Accounts).findOne({
        discordLinkCode: code,
      });

      if (!account) {
        await interaction.reply(
          "Invalid code. Please check the code and try again."
        );
        return;
      }

      if (account.discordUserId) {
        interaction.reply(
          `This Discord account was already linked to <@${account.discordUserId}>. Removing the link.`
        );
      } else {
        interaction.reply(
          `Successfully linked your Discord account to <@${interaction.user.id}>.`
        );
      }

      await db.collection(CollectionId.Accounts).updateOne(
        { _id: account._id },
        {
          $set: {
            discordUserId: interaction.user.id,
          },
        }
      );
    },
  },
];

const commands = commandArray.reduce((acc, command) => {
  acc[command.builder.name] = command;
  return acc;
}, {} as Record<string, Command>);

export default commands;
