import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import {
  AutocompleteInteraction,
  Collection,
  CommandInteraction,
  MessageAttachment,
} from "discord.js";
import { prisma } from "../../lib";
import {
  autocomplete,
  findMolecule,
  generateImage,
  ImageGenerator,
  moleculeHash,
} from "../../uitl/chemistry";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";

@ApplyOptions<CommandOptions>({
  name: "molecule",
  description: "Displays the inputed molecule.",
  fullCategory: ["Chemistry"],
  enabled: true,
})
export class MoleculeCommand extends Command {
  private findGenerator(query: string): ImageGenerator | undefined {
    return Object.values(ImageGenerator)
      .filter(g => g.toLowerCase() === query.toLowerCase())
      .shift();
  }

  private replaceSpecial(query: string): string {
    return query.replace(/\W+/g, "").trim() || "molecule";
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    const query = interaction.options.getString("query")?.trim();
    const generatorQuery =
      interaction.options.getString("generator")?.trim() ?? ImageGenerator.Openchemlib;

    const generator = this.findGenerator(generatorQuery);

    if (!generator)
      return interaction.reply(ephemeralEmbed(ThemedEmbeds.Error("Invalid generator.")));
    if (!query) return interaction.reply(ephemeralEmbed(ThemedEmbeds.Error("No query provided.")));

    const result = await findMolecule(query);
    if (!result)
      return interaction.reply(
        ephemeralEmbed(ThemedEmbeds.Error(`Molecule \`${query}\` not found.`))
      );

    await interaction.deferReply();

    const render = await generateImage(result.molecule, generator);
    if (render instanceof URL) {
      await interaction.editReply(`**${query}**`);
      return interaction.followUp(render.href);
    }

    const attachment = new MessageAttachment(
      render,
      this.replaceSpecial(query) + ".png"
    ).setDescription(`the molecule from the query: '${query}'`);

    const imageMessage = await interaction.editReply({
      content: `**${query}**`,
      files: [attachment],
    });

    if (!(imageMessage.attachments instanceof Collection)) return;

    const url = imageMessage.attachments.first()?.proxyURL;
    if (!url) return this.container.logger.warn("No proxyURL found.");

    prisma.image.create({
      data: {
        key: moleculeHash(result.molecule),
        name: query,
        type: generator,
        url,
      },
    });
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction) {
    const query = interaction.options.getString("query");
    const generator = interaction.options.getString("generator");

    if (generator) {
      // autocomplete for generator
      const options = Object.values(ImageGenerator);
      const results = options.filter(option =>
        option.toLowerCase().includes(generator.toLowerCase())
      );

      return interaction.respond(results.map(k => ({ name: k, value: k })));
    } else if (query) {
      // autocomplete for query
      const options = await autocomplete(query);

      return interaction.respond(options.map(k => ({ name: k, value: k })));
    }
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      builder =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption(opt =>
            opt
              .setName("query")
              .setDescription("The name of the molecule.")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addStringOption(opt =>
            opt
              .setName("generator")
              .setDescription("The method used to generate the image.")
              .setAutocomplete(true)
          ),
      {
        // behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }
}
