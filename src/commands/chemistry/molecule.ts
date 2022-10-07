import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions, RegisterBehavior } from "@sapphire/framework";
import {
  AutocompleteInteraction,
  Collection,
  CommandInteraction,
  MessageAttachment,
} from "discord.js";
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
    const query = interaction.options.getString("query")?.trim();

    if (!query) return interaction.reply(ephemeralEmbed(ThemedEmbeds.Error("No query provided.")));

    const result = await findMolecule(query);
    if (!result)
      return interaction.reply(
        ephemeralEmbed(ThemedEmbeds.Error(`Molecule \`${query}\` not found.`))
      );

    await interaction.deferReply();

    const render = await generateImage(result.molecule);

    if (render instanceof URL) {
      interaction.followUp(render.href);
    } else {
      const attachment = new MessageAttachment(
        render,
        this.replaceSpecial(query) + ".png"
      ).setDescription(`the molecule from the query: '${query}'`);

      const imageMessage = await interaction.followUp({
        files: [attachment],
      });

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

    await interaction.editReply(`**${query}**`); // edit it later to have bouth messages on the same 'stack'
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
