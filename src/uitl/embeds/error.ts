import { MessageEmbed } from "discord.js";
import { twemojiUrl } from "../image";

const base = new MessageEmbed().setColor("RED").setAuthor({
  name: "Error",
  iconURL: twemojiUrl("💥"),
});

export const ErrorEmbed = (content: string = "") => {
  return new MessageEmbed(base).setDescription(content);
};
