import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

@ApplyOptions<CommandOptions>({
  name: "game",
  description: "Play a game.",
  fullCategory: ["Basic"],
  enabled: true,
  chatInputCommand: {
    register: true,
    // behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
  },
})
export class MoleculeCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    interaction.reply({
      content: `Pong :ping_pong:! (${interaction.client.ws.ping}ms)`,
      ephemeral: true,
    });
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
