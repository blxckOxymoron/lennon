import { APIApplicationCommandOptionChoice } from "discord-api-types/v9";
import { ApplicationCommandOptionChoiceData } from "discord.js";

export const nameAndVal = (
  str: string
): ApplicationCommandOptionChoiceData & APIApplicationCommandOptionChoice<string> => ({
  name: str,
  value: str,
});
