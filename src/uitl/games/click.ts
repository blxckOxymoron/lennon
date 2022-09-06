import { Awaitable, MessageActionRow, MessageButton, User } from "discord.js";
import { ErrorOrMessage, MoveError } from ".";
import { DiscordGame } from "./discordgame";

export class ClickGame extends DiscordGame<
  { clicked: boolean },
  { favouriteColors: Record<string, number> },
  { buttonColor: string }
> {
  public interactionPrefix = "click";
  public data: { favouriteColors: Record<string, number> } = {
    favouriteColors: {},
  };

  async handleMove(player: User, move: { buttonColor: string }): Promise<ErrorOrMessage | void> {
    const d = await this.getDataFor(player);
    if ("error" in d) return d;

    if (d.clicked) return { error: MoveError.Custom, messageKey: "games/click:e_already_clicked" };

    d.clicked = true;

    this.data.favouriteColors[move.buttonColor] ??= 0;
    this.data.favouriteColors[move.buttonColor]++;
  }

  public override async start(): Promise<void> {
    super.start();
    this.channel.send({ components: [gameInterface] });
  }

  public override getInitialPlayerData(_player: User): Awaitable<{ clicked: boolean }> {
    return { clicked: false };
  }
}

const gameInterface = new MessageActionRow().addComponents(
  new MessageButton().setCustomId("click-red").setEmoji("🟥").setStyle("DANGER"),
  new MessageButton().setCustomId("click-blue").setEmoji("🟦").setStyle("PRIMARY"),
  new MessageButton().setCustomId("click-green").setEmoji("🟩").setStyle("SUCCESS"),
  new MessageButton().setCustomId("click-gray").setEmoji("⬜").setStyle("SECONDARY")
);
