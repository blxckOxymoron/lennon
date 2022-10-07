import { resolveKey } from "@sapphire/plugin-i18next";
import { Interaction, TextChannel } from "discord.js";
import { DiscordGame } from "./discordgame";
import { ThemedEmbeds } from "../embeds";
import { DiscordGameImpl } from ".";

class GameManager {
  games: DiscordGame<any, any, any>[] = [];

  async newGame(interaction: Interaction, gameImpl: DiscordGameImpl) {
    const channel = interaction.channel as TextChannel; //TODO create thread
    const game = new gameImpl(channel, interaction.user);
    await channel.send({
      embeds: [
        ThemedEmbeds.Primary(await resolveKey(channel, "games/main:welcome", { game: game.name })),
      ],
    });
    this.games.push(game);
  }

  removeGame(game: DiscordGame<any, any, any>) {
    this.games.splice(this.games.indexOf(game), 1);
  }

  getGameForChannel(channel: TextChannel) {
    return this.games.find(game => game.channel.id === channel.id);
  }
}

export default new GameManager();
