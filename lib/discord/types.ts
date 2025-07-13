import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

type Command = {
  builder: SlashCommandBuilder;
  handler: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export default Command;