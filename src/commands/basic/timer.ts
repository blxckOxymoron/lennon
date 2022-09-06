import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions } from "@sapphire/framework";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import { nameAndVal } from "../../uitl/discord/interactions";
import { ephemeralEmbed, ThemedEmbeds } from "../../uitl/embeds";

@ApplyOptions<CommandOptions>({
  name: "timer",
  description: "Set a timer",
  fullCategory: ["Basic"],
  enabled: true,
  chatInputCommand: {
    register: true,
    // behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
  },
})
export class TimerCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const name = interaction.options.getString("name");
    const amount = interaction.options.getString("amount");
    if (amount === null || name === null) return;

    const duration = this.parseDurationMixed(amount);
    await interaction.reply(
      ephemeralEmbed(
        ThemedEmbeds.Primary(
          `Timer for **${name}** set to <t:${Math.ceil(Date.now() / 1000) + duration}:R>`
        )
      )
    );

    setTimeout(() => {
      interaction.user.send({
        embeds: [ThemedEmbeds.Constants.TimerEnded(name)],
      });
    }, duration * 1000);
  }

  suffixMultipliers = {
    s: 1,
    m: 60,
    h: 3600,
  };
  suffixes = Object.keys(this.suffixMultipliers);

  durationFormatter = / +(?=[A-z ])|[^ 0-9.smh]/g;

  private parseDurationMixed(timeString: string): number {
    return timeString
      .replaceAll(this.durationFormatter, "") // remove spaces between number and unit
      .split(" ")
      .map(val => this.parseDuration(val)) // only `this.parseDuration` loses the `this` reference
      .reduce((a, b) => a + b);
  }

  public parseDuration(timeString: string): number {
    const unit = timeString.slice(-1);
    const amount = parseInt(timeString.slice(0, -1)) || 10;
    const multiplier = this.suffixMultipliers[unit] || this.suffixMultipliers.m;

    return amount * multiplier; // if everything fails default to 10 minutes
  }

  exampleAmounts = ["1m 30s", "10m", "30m", "1h", "1h 30m"];

  public override async autocompleteRun(interaction: AutocompleteInteraction) {
    const amount = interaction.options.getString("amount");
    if (amount === null) return;

    const formatted = amount.replaceAll(this.durationFormatter, "");
    const end = formatted.slice(-1);
    const endsWithUnit = end in this.suffixMultipliers;
    const endsWithSpace = end === " ";
    const endsWithNumber = !isNaN(parseInt(end));

    if (endsWithUnit || endsWithSpace) {
      // -> "1m" "2000s "
      const suggestions = [
        "",
        ...this.suffixes.filter(u => !formatted.includes(u)).map(u => `1${u}`),
      ].map(suggestion => formatted + (endsWithSpace ? "" : " ") + suggestion);
      return interaction.respond(suggestions.map(nameAndVal));
    } else if (endsWithNumber) {
      // -> "2" "20m 1"
      const suggestions = this.suffixes.filter(u => !formatted.includes(u)).map(u => formatted + u);
      return interaction.respond(suggestions.map(nameAndVal));
    }
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(bld =>
      bld
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(opt =>
          opt.setName("name").setDescription("The name of the timer").setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName("amount")
            .setDescription("Timer duration (1m | 30s | 2h 30m)")
            .setRequired(true)
            .setAutocomplete(true)
        )
    );
  }
}
