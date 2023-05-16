import { Listener } from "@sapphire/framework";
import { DMChannel, NonThreadGuildBasedChannel, PermissionOverwrites } from "discord.js";

class ChannelUpdateListener extends Listener<"channelUpdate"> {
  public run(
    oldChannel: DMChannel | NonThreadGuildBasedChannel,
    newChannel: DMChannel | NonThreadGuildBasedChannel
  ) {
    if (oldChannel.type === "DM" || newChannel.type === "DM") return;
    const oldPermissions = oldChannel.permissionOverwrites.cache;
    const newPermissions = newChannel.permissionOverwrites.cache;

    const changes = newPermissions.merge(
      oldPermissions,
      (perm, key) => ({
        keep: true,
        value: `added new permissions for ${key}: ${this.formatPermissions(perm)}`,
      }), // in self
      (perm, key) => ({
        keep: true,
        value: `deleted all permissions for ${key}: ${this.formatPermissions(perm)}`,
      }), // in other
      (newPerm, oldPerm, key) => ({
        keep:
          newPerm.allow.bitfield !== oldPerm.allow.bitfield ||
          newPerm.deny.bitfield !== oldPerm.deny.bitfield,
        value: `changed permissions for ${key}: \`${this.formatPermissions(
          oldPerm
        )}\` -> \`${this.formatPermissions(newPerm)}\``,
      }) // in both
    );

    this.container.logger.info(changes);
  }

  public formatPermissions(permissions: PermissionOverwrites) {
    return (
      "allowed: " +
      permissions.allow.toArray().join(", ") +
      "; denied: " +
      permissions.deny.toArray().join(", ")
    );
  }
}

export default ChannelUpdateListener;
