import { resolveKey } from "@sapphire/plugin-i18next";
import { GuildTextBasedChannel, Interaction } from "discord.js";
import { DiscordGame } from "./discordgame";
import { ThemedEmbeds } from "../embeds";
import { DiscordGameImpl } from ".";
import { getGuildData } from "../data/guilds";

class GameManager {
  games: DiscordGame<any, any, any>[] = [];

  async newGame(
    interaction: Interaction,
    gameImpl: DiscordGameImpl
  ): Promise<string | GuildTextBasedChannel> {
    const gID = interaction.guildId;
    if (gID === null) return "error:only_in_guild";

    const gData = await getGuildData(gID);
    if (gData.gameChannelId === null) return "games/error:no_game_channel";

    const channel = await interaction.client.channels.fetch(gData.gameChannelId);
    if (!channel?.isText()) return "error:only_in_guild";

    const creatorName = await interaction.guild?.members
      .fetch(interaction.user.id)
      .then(m => m.displayName);

    const gameMessage = await channel.send({
      embeds: [
        ThemedEmbeds.Primary(
          await resolveKey(channel, "games/main:game_created", {
            game: gameImpl.name,
            name: creatorName,
          })
        ),
      ],
    });
    const thread = await gameMessage.startThread({
      name: gameImpl.name + " | " + creatorName,
    });

    const game = new gameImpl(thread, interaction.user);
    await thread.send({
      embeds: [
        ThemedEmbeds.Primary(await resolveKey(thread, "games/main:welcome", { game: game.name })),
      ],
    });
    this.games.push(game);

    return thread;
  }

  removeGame(game: DiscordGame<any, any, any>) {
    this.games.splice(this.games.indexOf(game), 1);
  }

  getGameForChannel(channel: GuildTextBasedChannel) {
    return this.games.find(game => game.channel.id === channel.id);
  }
}

export default new GameManager();
