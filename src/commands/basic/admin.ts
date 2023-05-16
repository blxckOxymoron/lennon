import { ApplyOptions } from "@sapphire/decorators";
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  RegisterBehavior,
} from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { CommandInteraction } from "discord.js";
import { getGuildData } from "../../uitl/data/guilds.js";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds.js";
import { PrimaryEmbed } from "../../uitl/embeds.js";

@ApplyOptions<CommandOptions>({
  name: "admin",
  description: "Admin settings",
  fullCategory: ["Basic"],
  enabled: true,
})
export class AdminCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const hasPermission = interaction.memberPermissions?.has("ADMINISTRATOR") ?? false;

    if (!hasPermission) {
      await interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Error(await resolveKey(interaction, "error:missing_permission"))
        )
      );
      return;
    }

    switch (interaction.options.getSubcommand()) {
      case "info": {
        await this.infoRun(interaction);
        break;
      }
      default: {
        await interaction.reply(
          ephemeralEmbed(
            ThemedEmbeds.Error(
              await resolveKey(interaction, "error:with_code", { code: "no_subcommand" })
            )
          )
        );
      }
    }
  }

  private async infoRun(interaction: CommandInteraction) {
    const gId = interaction.guildId;

    if (!gId) {
      return await interaction.reply(
        ephemeralEmbed(ThemedEmbeds.Error(await resolveKey(interaction, "error:only_in_guild")))
      );
    }

    const infoEmbed = PrimaryEmbed(await resolveKey(interaction, "basic/admin:info"));

    const guildData = await getGuildData(gId);

    infoEmbed.addFields({
      name: "language",
      value: guildData.language,
      inline: true,
    });

    await interaction.reply({
      ephemeral: true,
      embeds: [infoEmbed],
    });
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      bld =>
        bld
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand(sub =>
            sub.setName("info").setDescription("get info about data stored for this guild")
          ),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
        idHints: ["925486066234982410"],
      }
    );
  }
}
