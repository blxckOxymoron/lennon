import { InteractionReplyOptions, MessageEmbed } from "discord.js";
import { twemojiUrl } from "./image/twemoji.js";

export function ephemeralEmbed(embed: MessageEmbed): InteractionReplyOptions {
  return {
    embeds: [embed],
    ephemeral: true,
  };
}

export const TimerEnded = (name: string) =>
  new MessageEmbed()
    .setColor("YELLOW")
    .setAuthor({
      name: "Timer",
      iconURL: twemojiUrl("⏰"),
    })
    .setTitle(`Your timer for **${name}** has ended!`)
    .setTimestamp();

const errorBase = new MessageEmbed().setColor("RED").setAuthor({
  name: "Error",
  iconURL: twemojiUrl("💥"),
});

export const ErrorEmbed = (content: string = "") => {
  return new MessageEmbed(errorBase).setDescription(content);
};

const primaryBase = new MessageEmbed().setColor("BLURPLE");

export const PrimaryEmbed = (content: string = "") => {
  return new MessageEmbed(primaryBase).setTitle(content);
};

export namespace ThemedEmbeds {
  export const Primary = PrimaryEmbed;
  export const Error = ErrorEmbed;
  export const Constants = {
    TimerEnded,
  };
}
