import { LogLevel, SapphireClient, Logger } from "@sapphire/framework";
import { Intents, InviteGenerationOptions, Permissions } from "discord.js";
import { Config } from "./config";
import chalk from "chalk";

export class Lennon extends SapphireClient {
  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
      ],
      loadDefaultErrorListeners: true,
      logger: {
        instance: new ColorLogger(LogLevel.Info),
      },
    });
  }

  public async start(): Promise<void> {
    await this.login(Config.CLIENT_TOKEN);
  }
}

export const invitePermissions: InviteGenerationOptions = {
  scopes: ["bot", "applications.commands"],
  permissions: [
    Permissions.FLAGS.ATTACH_FILES,
    Permissions.FLAGS.CREATE_INSTANT_INVITE,
    Permissions.FLAGS.MANAGE_THREADS,
    Permissions.FLAGS.EMBED_LINKS,
    Permissions.FLAGS.MANAGE_ROLES,
    Permissions.FLAGS.SEND_MESSAGES, // maybe not
  ],
};

class ColorLogger extends Logger {
  colors = {
    [LogLevel.Debug]: chalk.magentaBright.bold(">>"),
    [LogLevel.Info]: chalk.cyanBright.bold(">>"),
    [LogLevel.Warn]: chalk.yellowBright.bold(">>"),
    [LogLevel.Error]: chalk.redBright.bold(">>"),
    [LogLevel.Fatal]: chalk.redBright.bold(">>"),
    [LogLevel.Trace]: chalk.blueBright.bold(">>"),
  };

  override write(level: LogLevel, ...values: readonly unknown[]): void {
    super.write(level, this.colors[level], ...values);
  }
}
