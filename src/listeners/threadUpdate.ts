import { Events, Listener } from "@sapphire/framework";
import { ThreadChannel } from "discord.js";
import manager from "../uitl/games/manager";

export class ThreadUpdateListener extends Listener<typeof Events["ThreadUpdate"]> {
  run(_: ThreadChannel, newThread: ThreadChannel) {
    if (newThread.archived) {
      manager.removeGameForChannel(newThread);
    }
  }
}
