import { ApplyOptions } from "@sapphire/decorators";
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  RegisterBehavior,
} from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v9";
import { CommandInteraction, TextChannel } from "discord.js";
import { prisma } from "../../lib";
import { getGuildData } from "../../uitl/data/guilds";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";
import { PrimaryEmbed } from "../../uitl/embeds/primary";

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
      case "gamechannel": {
        await this.gamechannelRun(interaction);
        break;
      }
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

  private get gameCommand() {
    return this.container.client.application?.commands.cache.find(it => {
      return it.name === "game" && it.type === "CHAT_INPUT";
    })?.id;
  }

  private async gamechannelRun(interaction: CommandInteraction) {
    const channel = interaction.options.getChannel("channel", true) as TextChannel;
    const gId = interaction.guildId;
    if (!gId) {
      await interaction.reply(
        ephemeralEmbed(ThemedEmbeds.Error(await resolveKey(interaction, "error:only_in_guild")))
      );
      return;
    }

    const permissions = channel.permissionsFor(interaction.guild?.me!, true);

    if (!permissions.has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Error(await resolveKey(interaction, "games/error:no_text_permissions"))
        )
      );
      return;
    }

    if (
      !permissions.has(
        PermissionFlagsBits.ManageThreads &
          PermissionFlagsBits.CreatePublicThreads &
          PermissionFlagsBits.SendMessagesInThreads
      )
    ) {
      await interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Error(await resolveKey(interaction, "games/error:no_thread_permissions"))
        )
      );
      return;
    }

    let guildData = await getGuildData(gId); // mainly to ensure it exists
    guildData = await prisma.guild.update({
      where: { id: guildData.id },
      data: {
        gameChannelId: channel.id,
      },
    });

    await channel.send({
      embeds: [
        PrimaryEmbed(
          await resolveKey(channel, "games/main:channel_explanation", {
            command: `</game:${this.gameCommand}>`,
          })
        ),
      ],
    });

    await interaction.reply(
      ephemeralEmbed(
        ThemedEmbeds.Primary(await resolveKey(interaction, "basic/admin:gamechannel_updated"))
      )
    );
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

    infoEmbed.addFields(
      {
        name: "gameChannelId",
        value: "<#" + guildData.gameChannelId + ">",
        inline: true,
      },
      {
        name: "language",
        value: guildData.language,
        inline: true,
      }
    );

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
            sub
              .setName("gamechannel")
              .setDescription("select a channel to play games in")
              .addChannelOption(opt =>
                opt
                  .setName("channel")
                  .setDescription("the channel to play games in")
                  .setRequired(true)
                  .addChannelTypes(ChannelType.GuildText)
              )
          )
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
