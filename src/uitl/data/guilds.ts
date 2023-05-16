import { Guild } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

/**
 *
 * @param guildId guild to get the data
 * @returns guild data from the database
 */
export async function getGuildData(guildId: string): Promise<Guild> {
  const res = await prisma.guild.findFirst({
    where: {
      guildId,
    },
  });
  const exists = res !== null;

  if (exists) return res;

  return await prisma.guild.create({
    data: {
      guildId,
      language: "de-DE", //TODO: remove when english support is added
    },
  });
}
