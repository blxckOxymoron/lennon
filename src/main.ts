import { container } from "@sapphire/framework";
import { Lennon } from "./lib";

export const client = new Lennon();

(async () => {
  try {
    await client.start();
    container.logger.info(
      "Logged in!",
      "Admin-Invite:",
      client.generateInvite({
        permissions: ["ADMINISTRATOR"],
        scopes: ["bot", "applications.commands"],
      })
    );
    container.logger.info(client.user?.avatarURL());
  } catch (e) {
    container.logger.error(e);
    process.exit(1);
  }
})();
