import { PrimaryEmbed } from "./primary";
import { ErrorEmbed } from "./error";
import { InteractionReplyOptions, MessageEmbed } from "discord.js";

export namespace ThemedEmbeds {
  export const Primary = PrimaryEmbed;
  export const Error = ErrorEmbed;
}

export type ImplementedLocales = "de" | "en";
export type LocalizationMap = { [key in ImplementedLocales]: string | null };

export const ephemeralEmbed = (embed: MessageEmbed): InteractionReplyOptions => {
  return {
    embeds: [embed],
    ephemeral: true,
  };
};
