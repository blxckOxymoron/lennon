import { resolveKey } from "@sapphire/plugin-i18next";
import {
  Awaitable,
  ButtonInteraction,
  CacheType,
  EmbedFieldData,
  MessageActionRow,
  MessageButton,
  User,
} from "discord.js";
import { ErrorOrMessage, GamePhase, MoveError } from ".";
import { ephemeralEmbed, ThemedEmbeds } from "../embeds";
import { DiscordGame, WithInteraction } from "./discordgame";

type ClickGameMove = {
  buttonColor: string;
};
export class ClickGame extends DiscordGame<
  { clicked: boolean },
  { favouriteColors: Record<string, number> },
  ClickGameMove
> {
  public name: string = "Click Game";
  public override interactionPrefix = "click";
  public data: { favouriteColors: Record<string, number> } = {
    favouriteColors: {},
  };

  public override async buttonHandler(interaction: ButtonInteraction<CacheType>) {
    const color = interaction.customId.split("_")[1] ?? "mystery";
    await this.makeMove(interaction.user, { buttonColor: color, interaction });
  }

  async handleMove(
    player: User,
    { buttonColor, interaction }: WithInteraction<ClickGameMove>
  ): Promise<ErrorOrMessage | void> {
    const d = await this.getDataFor(player);
    if ("error" in d) return d;

    if (d.clicked) return { error: MoveError.Custom, messageKey: "games/click:e_already_clicked" };

    d.clicked = true;

    this.data.favouriteColors[buttonColor] ??= 0;
    this.data.favouriteColors[buttonColor]++;

    interaction.reply(
      ephemeralEmbed(
        ThemedEmbeds.Primary(
          await resolveKey(interaction, "games/click:choice", {
            choice: emojis[buttonColor] ?? "🌈",
          })
        )
      )
    );

    const anyoneNotVoted = this.playerIds.some(id => !this.playerdata[id]?.clicked);
    if (!anyoneNotVoted) await this.end();
  }

  public override async start() {
    await super.start();
    await this.channel.send({
      components: [gameInterface],
      embeds: [ThemedEmbeds.Primary(await resolveKey(this.channel, "games/click:explanation"))],
    });
    setTimeout(() => this.phase === GamePhase.Running && this.end(), 10000); // check is also done in Game#end()
  }

  public override async end() {
    await super.end(undefined);

    const resultFields: EmbedFieldData[] = Object.entries(this.data.favouriteColors).map(
      ([color, count]) => ({ name: emojis[color] ?? color, value: count.toString(), inline: true })
    );

    await this.channel.send({
      embeds: [
        ThemedEmbeds.Primary(await resolveKey(this.channel, "games/click:results")).addFields(
          resultFields
        ),
      ],
    });
  }

  public override getInitialPlayerData(_player: User): Awaitable<{ clicked: boolean }> {
    return { clicked: false };
  }
}

const emojis = {
  red: "🟥",
  green: "🟩",
  blue: "🟦",
  black: "⬛",
};

const gameInterface = new MessageActionRow().addComponents(
  new MessageButton().setCustomId("click_red").setEmoji("🟥").setStyle("DANGER"),
  new MessageButton().setCustomId("click_blue").setEmoji("🟦").setStyle("PRIMARY"),
  new MessageButton().setCustomId("click_green").setEmoji("🟩").setStyle("SUCCESS"),
  new MessageButton().setCustomId("click_black").setEmoji("⬛").setStyle("SECONDARY")
);
