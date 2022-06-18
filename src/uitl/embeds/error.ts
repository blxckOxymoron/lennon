import { MessageEmbed } from "discord.js";

const base = new MessageEmbed().setColor("RED");

export const ErrorEmbed = (content: string) => {
  return new MessageEmbed(base).setDescription(content);
};
