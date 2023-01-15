import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions, RegisterBehavior } from "@sapphire/framework";
import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  Collection,
  CommandInteraction,
  FileOptions,
} from "discord.js";
import { prisma } from "../../lib";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";
import { CachedImage } from "../../uitl/image";
import { generateImage, getTexName, texHash } from "../../uitl/math";

type AdditionalData = {
  query: string;
  creatorId: string;
};

@ApplyOptions<CommandOptions>({
  name: "equation",
  description: "Displays the inputed equation.",
  fullCategory: ["Math"],
  enabled: true,
  chatInputCommand: { register: true },
})
export class EquationCommand extends Command {
  private replaceSpecial(query: string): string {
    return query.replace(/ +/g, "-").slice(0, 32) || "equation";
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    const query = interaction.options.getString("text")?.replaceAll(/ +/g, " ")?.trim();
    const title = interaction.options.getString("title")?.replaceAll(/ +/g, " ")?.trim();
    if (!query) return;

    await interaction.deferReply();

    const render = await generateImage(query).catch((e: Error) => e);

    if (render instanceof Error) {
      await interaction.followUp(
        ephemeralEmbed(ThemedEmbeds.Error("Invalid equation: " + render.message).setTitle(query))
      );
      return;
    }

    const name = title || (await getTexName(query));
    const attachment: FileOptions = {
      name: this.replaceSpecial(query) + ".png",
      description: name.slice(0, 64),
      attachment: render instanceof URL ? render.href : render,
    };

    await interaction.followUp({
      content: title ? `**${title}**` : null,
      files: [attachment],
    });

    if (render instanceof Buffer) {
      const imageMessage = await interaction.fetchReply();
      if (!(imageMessage.attachments instanceof Collection)) return;

      const url = imageMessage.attachments.first()?.proxyURL;
      if (!url) return this.container.logger.warn("No proxyURL found.");

      const creatorId = interaction.user.id;
      const metadata: AdditionalData = { query, creatorId };
      await prisma.image.create({
        data: {
          key: texHash(query),
          name: title || query,
          type: CachedImage.Equation,
          data: JSON.stringify(metadata),
          url,
        },
      });
    }
  }

  examples: ApplicationCommandOptionChoiceData[] = [
    { name: "Freier Fall", value: "s(t) = \\frac12 * g * t^2 + t * a + s_0" },
    { name: "Mitternachtsformel", value: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
    { name: "Brüche", value: "\\frac{1}{2} + \\frac12 + {1 \\over 3} + \\dfrac{1}{4}" },
  ];

  public override async autocompleteRun(interaction: AutocompleteInteraction) {
    const query = interaction.options.getString("text");
    if (query === null) return;

    if (query.length < 3) return interaction.respond(this.examples);

    const suggestions = await prisma.image.findMany({
      where: {
        name: {
          contains: query,
        },
        type: CachedImage.Equation,
      },
      select: {
        data: true,
        name: true,
      },
    });

    const mappedSuggestions = await Promise.all(
      suggestions.map(async ({ name, data }) => {
        const { query, creatorId } = JSON.parse(data) as AdditionalData;
        const creator = await this.container.client.users.fetch(creatorId);
        return {
          name: `${name} (by ${creator.tag})`,
          value: query,
        };
      })
    );

    interaction.respond([
      { name: "!! Community Suggestions - not checked !!", value: "danger" },
      ...mappedSuggestions,
    ]);
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      bld =>
        bld
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption(opt =>
            opt
              .setName("text")
              .setDescription("The math equaltion to be displayed.")
              .setAutocomplete(true)
              .setRequired(true)
          )
          .addStringOption(opt =>
            opt.setName("title").setDescription("A title to be displayed above the equation.")
          ),
      {
        idHints: ["988031443290714142", "1027968333133402164"],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }
}
