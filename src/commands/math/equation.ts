import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { Collection, CommandInteraction, MessageAttachment } from "discord.js";
import { prisma } from "../../lib";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";
import { CachedImage } from "../../uitl/image";
import { generateImage, getTexName, texHash } from "../../uitl/math";

@ApplyOptions<CommandOptions>({
  name: "equation",
  description: "Displays the inputed equation.",
  fullCategory: ["Math"],
  enabled: true,
  chatInputCommand: { register: true },
})
export class EquationCommand extends Command {
  private formatName(query: string): string {
    return query.replace(/ +/g, "-").slice(0, 32) || "equation";
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    const query = interaction.options.getString("text");
    if (!query) return;

    await interaction.deferReply();

    const render = await generateImage(query).catch((e: Error) => e);

    if (render instanceof Error) {
      await interaction.deleteReply();

      return interaction.followUp(
        ephemeralEmbed(ThemedEmbeds.Error("Invalid equation: " + render.message).setTitle(query))
      );
    }

    if (render instanceof URL) {
      return interaction.editReply(render.href);
    }

    const name = await getTexName(query);

    const attachment = new MessageAttachment(render, this.formatName(name) + ".png").setDescription(
      name.slice(0, 64)
    );

    const imageMessage = await interaction.editReply({
      files: [attachment],
    });

    if (!(imageMessage.attachments instanceof Collection)) return;

    const url = imageMessage.attachments.first()?.proxyURL;
    if (!url) return this.container.logger.warn("No proxyURL found.");

    await prisma.image.create({
      data: {
        key: texHash(query),
        name: query,
        type: CachedImage.Equation,
        url,
      },
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(bld =>
      bld
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(opt =>
          opt
            .setName("text")
            .setDescription("The math equaltion to be displayed.")
            .setRequired(true)
        )
    );
  }
}