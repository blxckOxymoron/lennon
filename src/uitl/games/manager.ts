import { resolveKey } from "@sapphire/plugin-i18next";
import { TextChannel } from "discord.js";
import { DiscordGame } from "./discordgame";
import { ThemedEmbeds } from "../embeds";

class GameManager {
  games: DiscordGame<any, any, any>[] = [];

  async addGame(game: DiscordGame<any, any, any>) {
    await game.channel.send({
      embeds: [
        ThemedEmbeds.Primary(
          await resolveKey(game.channel, "games/main:welcome", { game: game.name })
        ),
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
