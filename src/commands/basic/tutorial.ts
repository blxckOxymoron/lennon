import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions, RegisterBehavior } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { CommandInteraction } from "discord.js";
import { invitePermissions } from "../../lib/client.js";
import { nameAndVal } from "../../uitl/discord/interactions.js";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds.js";
import tutorials from "../../uitl/tutorials/tutorialStore.js";

@ApplyOptions<CommandOptions>({
  name: "tutorial",
  description: "Learn about the bot's functionality.",
  fullCategory: ["Basic"],
  enabled: true,
  chatInputCommand: { register: true },
})
export class TutorialCommand extends Command {
  commandNames = tutorials.map(t => t.name);

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
          ephemeralEmbed(
            ThemedEmbeds.Error(
              await resolveKey(interaction, "basic/tutorial:not_found", { command })
            )
          )
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

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      builder =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption(opt =>
            opt
              .setName("command")
              .setDescription("The command you want to learn about.")
              .setChoices(...this.commandNames.map(nameAndVal))
          ),
      {
        idHints: ["988052447765336074", "925486066234982413"],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }
}
