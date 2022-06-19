import { MessageEmbed } from "discord.js";
import { twemojiUrl } from "../image";

export const TimerEnded = (name: string) =>
  new MessageEmbed()
    .setColor("YELLOW")
    .setAuthor({
      name: "Timer",
      iconURL: twemojiUrl("⏰"),
    })
    .setTitle(`Your timer for **${name}** has ended!`)
    .setTimestamp();
