import { MessageEmbed } from "discord.js";

const base = new MessageEmbed().setColor("BLURPLE");

export const PrimaryEmbed = (content: string) => {
  return new MessageEmbed(base).setDescription(content);
};
