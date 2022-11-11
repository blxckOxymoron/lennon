import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { CacheType, ButtonInteraction } from "discord.js";
import { GameManager } from "../../uitl/games";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ButtonHandler extends InteractionHandler {
  public override async run(
    interaction: ButtonInteraction<CacheType>,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    const { game } = parsedData;
    game.buttonHandler(interaction);
  }

  public override async parse(interaction: ButtonInteraction) {
    const channel = interaction.channel;
    if (!channel || !(channel.isText() && channel.type !== "DM")) return this.none();

    const game = GameManager.getGameForChannel(channel);
    if (!game || !interaction.customId.startsWith(game.interactionPrefix)) return this.none();

    return this.some({ game });
  }
}
