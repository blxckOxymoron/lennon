import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

@ApplyOptions<CommandOptions>({
  name: "molecule",
  description: "Displays the inputed molecule.",
  fullCategory: ["Chemistry"],
  enabled: true,
  chatInputCommand: {
    register: true,
    descriptionLocalizations: {
      de: "Zeigt das angegebene Molekül an.",
    },
  },
})
export class MoleculeCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    interaction.reply("WIP");
  }
}
