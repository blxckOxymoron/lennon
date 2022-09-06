import { container } from "@sapphire/framework";
import { Lennon } from "./lib";
import "@sapphire/plugin-i18next/register";

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
  } catch (e) {
    container.logger.error(e);
    process.exit(1);
  }
})();
