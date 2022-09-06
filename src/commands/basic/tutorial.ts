import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { invitePermissions } from "../../lib";
import { nameAndVal } from "../../uitl/discord/interactions";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";
import tutorials from "../../uitl/tutorials";

@ApplyOptions<CommandOptions>({
  name: "tutorial",
  description: "Learn about the bot's functionality.",
  fullCategory: ["Basic"],
  enabled: true,
  chatInputCommand: { register: true },
})
export class TutorialCommand extends Command {
  commandNames = tutorials.map(t => t.name);
  commandNamesAllResponse = this.commandNames.map(nameAndVal);

  public override async chatInputRun(interaction: CommandInteraction) {
    const command = interaction.options.getString("command")?.trim();
    if (command === undefined) {
      // Overview of all tutorials
      return interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Primary("Tutorials:").addFields(
            ...this.commandNames.map(name => ({ name, value: `/tutorial ${name}`, inline: true })),
            {
              name: "Links",
              value:
                "[Github](https://github.com/blxckOxymoron/lennon) | " +
                `[Invite](${this.container.client.generateInvite(invitePermissions)})`,
            }
          )
        )
      );
    } else {
      // specific tutorial
      const tutorial = tutorials.find(t => t.name === command);
      if (!tutorial)
        return interaction.reply(
          ephemeralEmbed(ThemedEmbeds.Error(`Tutorial \`${command}\` not found.`))
        );

      return interaction.reply(
        ephemeralEmbed(
          ThemedEmbeds.Primary(`Tutorial: ${tutorial.name}`).addFields(
            Object.entries(tutorial.info).map(([lang, value]) => ({
              name: `:flag_${lang}:`,
              value,
            }))
          )
        )
      );
    }
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction) {
    const command = interaction.options.getString("command");
    if (!command) return interaction.respond(this.commandNamesAllResponse);

    const filtered = this.commandNames.filter(c => c.startsWith(command));
    if (filtered.length > 0) return interaction.respond(filtered.map(nameAndVal));
    else return interaction.respond(this.commandNamesAllResponse);
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(opt =>
          opt
            .setName("command")
            .setDescription("The command you want to learn about.")
            .setAutocomplete(true)
        )
    );
  }
}
