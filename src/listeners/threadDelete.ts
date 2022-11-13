import { Listener, Events } from "@sapphire/framework";
import { ThreadChannel } from "discord.js";
import manager from "../uitl/games/manager";

export class ThreadDeleteListener extends Listener<typeof Events["ThreadDelete"]> {
  run(thread: ThreadChannel) {
    manager.removeGameForChannel(thread);
  }
}
