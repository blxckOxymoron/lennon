import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

@ApplyOptions<CommandOptions>({
  name: "ping",
  description: "Pings the bot.",
  fullCategory: ["Basic"],
  enabled: true,
  chatInputCommand: {
    register: true,
    idHints: ["982305196648566784"],
    behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
  },
})
export class PingCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    interaction.reply({
      content: `Pong :ping_pong:! (${interaction.client.ws.ping}ms)`,
      ephemeral: true,
    });
  }
}
