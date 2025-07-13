import { Embed, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "./types";
import { getMongoClient } from "lib/getMongoClient";
import CollectionId from "lib/types/CollectionId";
import Guild from "lib/types/Guild";
import { PlayerInstance } from "lib/types/entities/player";
import { difficultyOptions } from "lib/types/Difficulty";
import Account from "lib/types/Account";
import AbilityScore from "lib/types/AbilityScore";
import items from "lib/gamedata/items";
import { restoreFieldsAndMethods } from "lib/utils";
import { ItemInstance } from "lib/types/item";
import getPlayerManager from "lib/PlayerManager";

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
  {
    builder: new SlashCommandBuilder()
      .setName("profile")
      .setDescription("Displays details about a user's primary save.")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The username of the player to view the profile of.")
      ) as SlashCommandBuilder,
    handler: async (interaction) => {
      const user = interaction.options.getUser("user") || interaction.user;

      const db = await getMongoClient();

      const account = await db.collection(CollectionId.Accounts).findOne({
        discordUserId: user.id,
      });

      if (!account) {
        await interaction.reply(
          `No account linked to Discord user <@${user.id}>.`
        );
        return;
      }

      if (!account.primarySaveId) {
        await interaction.reply(
          `No primary save set for account <@${user.id}>. Set one on the save select page.`
        );
        return;
      }

      const player = restoreFieldsAndMethods(
        (await db
          .collection(CollectionId.PlayerInstances)
          .findOne({ _id: account.primarySaveId })) as PlayerInstance,
        new PlayerInstance()
      );

      if (!player) {
        await interaction.reply(
          `No player found for account <@${user.id}>. This is likely a bug.`
        );
        return;
      }

      const embed = new EmbedBuilder();

      embed.addFields(
        {
          name: "Level",
          value: player.level.toString(),
          inline: true,
        },
        {
          name: "XP",
          value: Math.round(player.xp).toLocaleString(),
          inline: true,
        },
        {
          name: "Health",
          value: player.getMaxHealth().toString(),
          inline: true,
        },
        {
          name: "Ability Scores",
          value: Object.values(AbilityScore)
            .map(
              (score) =>
                `${score}: ${player.getAbilityScore(score)} (${
                  player.abilityScores[score]
                } base)`
            )
            .join(", "),
          inline: true,
        },
        {
          name: "Equipment",
          value: player.equipment.items
            .map((item) =>
              restoreFieldsAndMethods(
                item,
                new ItemInstance(item.definitionId, item.amount)
              ).getName()
            )
            .join(", "),
        },
        {
          name: "Difficulty",
          value: difficultyOptions[player.difficulty].name,
          inline: true,
        }
      );

      if (player.guildId) {
        const guild = (await db
          .collection(CollectionId.Guilds)
          .findOne({ _id: player.guildId })) as Guild;
        if (guild) {
          embed.addFields({
            name: "Guild",
            value: guild.name,
            inline: true,
          });
        }
      }

      embed
        .setTitle(`${player.name}'s Profile`)
        .setColor("#0099ff")
        .setThumbnail(
          `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        );

      await interaction.reply({ embeds: [embed] });
    },
  },
  {
    builder: new SlashCommandBuilder()
      .setName("online")
      .setDescription("Lists all online players."),
    handler: async (interaction) => {
      const playerManager = getPlayerManager();

      const players = playerManager.getOnlinePlayers();

      let msg = `**Online Players: ${players.length}**\n`;
      players.forEach((player) => {
        msg += `- ${player.name}\n`;
      });

      await interaction.reply(msg);
    },
  },
];

const commands = commandArray.reduce((acc, command) => {
  acc[command.builder.name] = command;
  return acc;
}, {} as Record<string, Command>);

export default commands;
