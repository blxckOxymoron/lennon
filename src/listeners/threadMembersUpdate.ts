import { Events, Listener } from "@sapphire/framework";
import { Collection, Snowflake, ThreadMember } from "discord.js";
import manager from "../uitl/games/manager";

export class ThreadMembersUpdateListener extends Listener<typeof Events["ThreadMembersUpdate"]> {
  run(
    oldMembers: Collection<Snowflake, ThreadMember>,
    newMembers: Collection<Snowflake, ThreadMember>
  ) {
    const thread = newMembers.concat(oldMembers).first()?.thread;
    if (!thread) return;

    if (!newMembers.find(member => member.id === this.container.client.id)) {
      if (thread === undefined) return;
      manager.removeGameForChannel(thread);
      return;
    }

    const game = manager.getGameForChannel(thread);
    if (!game) return;

    // TODO add and remove players from game
  }
}
