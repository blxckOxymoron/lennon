import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions, RegisterBehavior } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { AutocompleteInteraction, Collection, CommandInteraction, FileOptions } from "discord.js";
import { prisma } from "../../lib";
import { autocomplete, findMolecule, generateImage, moleculeHash } from "../../uitl/chemistry";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";
import { CachedImage } from "../../uitl/image";

@ApplyOptions<CommandOptions>({
  name: "molecule",
  description: "Displays the inputed molecule.",
  fullCategory: ["Chemistry"],
  enabled: true,
  chatInputCommand: { register: true },
})
export class MoleculeCommand extends Command {
  private replaceSpecial(query: string): string {
    return query.replace(/\W+/g, "").trim() || "molecule";
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    const query = interaction.options.getString("query", true).trim();

    const result = await findMolecule(query);
    if (!result)
      return interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Error(
            await resolveKey(interaction, "chemistry/molecule:not_found", { query })
          )
        )
      );

    await interaction.deferReply();

    const render = await generateImage(result.molecule);

    const attachment: FileOptions = {
      name: this.replaceSpecial(query) + ".png",
      description: `the molecule from the query: '${query}'`,
      attachment: render instanceof URL ? render.href : render,
    };

    await interaction.followUp({
      content: `**${query}**`,
      files: [attachment],
    });

    if (render instanceof Buffer) {
      const imageMessage = await interaction.fetchReply();
      if (!(imageMessage.attachments instanceof Collection)) return;

      const url = imageMessage.attachments.first()?.proxyURL;
      if (!url) return this.container.logger.warn("No proxyURL found.");

      await prisma.image.create({
        data: {
          key: moleculeHash(result.molecule),
          name: query,
          type: CachedImage.Molecule,
          url,
        },
      });
    }
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction) {
    const query = interaction.options.getString("query");

    if (query === null) return;

    // autocomplete for query
    const options = await autocomplete(query);

    return interaction.respond(options.map(k => ({ name: k, value: k })));
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
          ),
      {
        idHints: ["982305197558730773", "1027968331594088468"],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }
}
