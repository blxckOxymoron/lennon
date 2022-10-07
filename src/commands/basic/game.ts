import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { CommandInteraction } from "discord.js";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";
import { discordGames, GameManager, GamePhase } from "../../uitl/games";
import { checkInteraction } from "../../uitl/games/checks";

@ApplyOptions<CommandOptions>({
  name: "game",
  description: "Play a game.",
  fullCategory: ["Basic"],
  enabled: true,
  chatInputCommand: {
    register: true,
    // behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
  },
})
export class GameCommand extends Command {
  private async createGameRun(interaction: CommandInteraction) {
    const { textChannel } = await checkInteraction(interaction, "textChannel");
    if (!textChannel) return;

    const gameName = interaction.options.getString("game", true);

    const game = discordGames[gameName];
    if (!game) {
      return await interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Error(
            await resolveKey(interaction, "error:with_code", { code: "gameNotFound" })
          )
        )
      );
    }

    await interaction.reply(
      ephemeralEmbed(
        ThemedEmbeds.Primary(await resolveKey(interaction, "games/main:create_success"))
      )
    );

    GameManager.newGame(interaction, game);
  }

  private async startGameRun(interaction: CommandInteraction) {
    const { game } = await checkInteraction(interaction, "game");
    if (!game) return;

    if (game.leaderId !== interaction.user.id) {
      return await interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Error(
            await resolveKey(interaction, "games/error:not_leader", {
              leader: `<@${game.leaderId}>`,
            })
          )
        )
      );
    }
    if (game.phase !== GamePhase.Waiting)
      return await interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Error(await resolveKey(interaction, "games/error:game_already_started"))
        )
      );

    await game.start();
    await interaction.reply(
      ephemeralEmbed(
        ThemedEmbeds.Primary(await resolveKey(interaction, "games/main:start_success"))
      )
    );
  }

  // @ts-ignore
  private async setChannelRun(interaction: CommandInteraction) {}

  public override async chatInputRun(interaction: CommandInteraction) {
    switch (interaction.options.getSubcommand()) {
      case "create":
        await this.createGameRun(interaction);
        break;
      case "start":
        await this.startGameRun(interaction);
        break;
      case "set-channel":
        await this.setChannelRun(interaction);
        break;
      default:
        this.container.logger.error("Unknown subcommand.");
    }
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      builder =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand(sub =>
            sub
              .setName("create")
              .setDescription("Create a game.")
              .addStringOption(opt =>
                opt
                  .setName("game")
                  .setDescription("The game you want to play.")
                  .setChoices(
                    ...Object.entries(discordGames).map(([key, game]) => ({
                      name: game.name,
                      value: key,
                    }))
                  )
                  .setRequired(true)
              )
          )
          .addSubcommand(sub =>
            sub.setName("start").setDescription("Start the game in the channel.")
          )
          .addSubcommand(sub =>
            sub
              .setName("set-channel")
              .setDescription("Set the channel for games.")
              .addChannelOption(opt =>
                opt
                  .setName("channel")
                  .setDescription("The channel to play games in.")
                  .setRequired(true)
              )
          )
      // { behaviorWhenNotIdentical: RegisterBehavior.Overwrite }
    );
  }
}
