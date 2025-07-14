import { ChatInputCommandInteraction, Interaction } from "discord.js";
import { discordIdToAccount, discordIdToPlayerInstance } from "lib/auth";
import getCollectionManager from "lib/getCollectionManager";
import { getMongoClient } from "lib/getMongoClient";
import { PlayerInstance } from "lib/types/entities/player";
import { restoreFieldsAndMethods } from "lib/utils";

export async function requirePrimarySave(interaction: Interaction) {
  const db = await getMongoClient();
  const collectionManager = getCollectionManager(db);
  const playerInstance = await discordIdToPlayerInstance(
    collectionManager,
    interaction.user.id
  );

  if (!playerInstance) {
    if (interaction.isChatInputCommand()) {
      await interaction.reply(
        "You need to have a primary save set to use this command."
      );
    }
    return;
  }

  restoreFieldsAndMethods(playerInstance, new PlayerInstance());

  return playerInstance;
}
