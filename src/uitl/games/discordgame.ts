import { resolveKey } from "@sapphire/plugin-i18next";
import { TextChannel, User } from "discord.js";
import { Game } from "./basegame";

export abstract class DiscordGame<P, S, M> extends Game<P, S, M, User> {
  public abstract interactionPrefix: string;
  public channel: TextChannel;

  public get creatorId() {
    return this.playerIds[0];
  }

  constructor(channel: TextChannel) {
    super();
    this.channel = channel;
  }

  public override async playerJoin(player: User) {
    const ingame = await super.playerJoin(player);

    if (ingame)
      this.channel.send(
        await resolveKey(this.channel, "games/main:player_join", { player: player.toString() })
      );

    return ingame;
  }

  public override async playerLeave(player: User) {
    const wasIngame = await super.playerLeave(player);

    if (wasIngame)
      this.channel.send(
        await resolveKey(this.channel, "games/main:player_leave", { player: player.toString() })
      );

    return wasIngame;
  }

  public override async start(): Promise<void> {
    super.start();
    this.channel.send(await resolveKey(this.channel, "games/main:start"));
  }

  public getIdFor(player: User): string {
    return player.id;
  }

  public async getPlayerFor(id: string): Promise<User> {
    return await this.channel.client.users.fetch(id);
  }
}
