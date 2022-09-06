import { resolveKey } from "@sapphire/plugin-i18next";
import { ButtonInteraction, MessageComponentInteraction, TextChannel, User } from "discord.js";
import { ErrorOrMessage, GameManager } from ".";
import { ephemeralEmbed, ThemedEmbeds } from "../embeds";
import { Game } from "./basegame";

export type WithInteraction<T> = T & {
  interaction: MessageComponentInteraction;
};

export abstract class DiscordGame<P, S, M> extends Game<P, S, WithInteraction<M>, User> {
  public interactionPrefix: string = "";
  public channel: TextChannel;

  public get leaderId() {
    return this.playerIds[0];
  }

  constructor(channel: TextChannel, creator: User) {
    super();
    this.channel = channel;
    this.playerJoin(creator);
  }

  public async buttonHandler(_interaction: ButtonInteraction) {}

  public override async makeMove(
    player: User,
    move: WithInteraction<M>
  ): Promise<void | ErrorOrMessage> {
    const error = await super.makeMove(player, move);
    if (error) {
      const key = "messageKey" in error ? error.messageKey : error.error;
      const message = ephemeralEmbed(ThemedEmbeds.Error(await resolveKey(move.interaction, key)));

      if (move.interaction.replied) await move.interaction.followUp(message);
      else await move.interaction.reply(message);
    }
    if (!move.interaction.replied || move.interaction.deferred) {
      await move.interaction.deferUpdate();
    }
  }

  public sendError() {}

  public override async playerJoin(player: User) {
    const ingame = await super.playerJoin(player);

    if (ingame)
      this.channel.send({
        embeds: [
          ThemedEmbeds.Primary(
            await resolveKey(this.channel, "games/main:player_join", {
              player: (await this.channel.guild.members.fetch(player)).displayName,
            })
          ),
        ],
      });

    return ingame;
  }

  public override async playerLeave(player: User) {
    const wasIngame = await super.playerLeave(player);

    if (wasIngame)
      this.channel.send({
        embeds: [
          ThemedEmbeds.Primary(
            await resolveKey(this.channel, "games/main:player_leave", {
              player: player.toString(),
            })
          ),
        ],
      });

    return wasIngame;
  }

  public override async start() {
    await super.start();
    await this.channel.send({
      embeds: [ThemedEmbeds.Primary(await resolveKey(this.channel, "games/main:start"))],
    });
  }

  public override async end() {
    await super.end();
    await this.channel.send({
      embeds: [ThemedEmbeds.Primary(await resolveKey(this.channel, "games/main:end"))],
    });
    GameManager.removeGame(this); //? should this be here?
  }

  public override getIdFor(player: User): string {
    return player.id;
  }

  public override async getPlayerFor(id: string): Promise<User> {
    return await this.channel.client.users.fetch(id);
  }
}
