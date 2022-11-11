import { resolveKey } from "@sapphire/plugin-i18next";
import { CommandInteraction, GuildTextBasedChannel } from "discord.js";
import { GameManager } from ".";
import { ephemeralEmbed, ThemedEmbeds } from "../embeds";
import { DiscordGame } from "./discordgame";

type CheckResult = {
  textChannel: GuildTextBasedChannel | undefined;
  game: DiscordGame<any, any, any> | undefined;
};

type Check = keyof CheckResult;

export async function checkInteraction(
  interaction: CommandInteraction,
  ...errorFor: Check[]
): Promise<CheckResult & { errors: Check[] }> {
  const textChannel =
    interaction.channel?.isText() && interaction.channel.type !== "DM"
      ? interaction.channel
      : undefined;

  const game = textChannel ? GameManager.getGameForChannel(textChannel) : undefined;

  const errors = await sendErrors(
    {
      textChannel,
      game,
    },
    interaction,
    errorFor
  );

  return {
    textChannel,
    game,
    errors,
  };
}

async function sendErrors(
  result: CheckResult,
  interaction: CommandInteraction,
  errorFor: Check[]
): Promise<Check[]> {
  const errorKeys = Object.entries(result)
    .filter(([key, value]) => {
      return value === undefined && errorFor.includes(key as Check);
    })
    .map(([key]) => key as Check);

  if (errorKeys.length > 0) {
    await interaction.reply(
      ephemeralEmbed(
        ThemedEmbeds.Error(
          (await resolveKey(interaction, `games/error:check_${errorKeys[0]}`)) +
            (errorKeys.length > 1 ? ` (+ ${errorKeys.length - 1})` : "")
        )
      )
    );
  }

  return errorKeys;
}
