import { ApplicationCommandOptionChoiceData } from "discord.js";

export const nameAndVal = (str: string): ApplicationCommandOptionChoiceData => ({
  name: str,
  value: str,
});
