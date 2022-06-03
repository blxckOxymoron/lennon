import { config } from "dotenv";

const envWithKeys: envFunction = keys => {
  const env = config().parsed;

  if (!env) throw new Error("No enviroment variables found!");

  for (const key of keys) {
    if (!env[key]) throw new Error(`Missing enviroment variable: ${key}`);
  }

  return env as any;
};

type envFunction = <T extends string>(keys: T[]) => { [K in T]: string };

export const Config = envWithKeys(["CLIENT_ID", "CLIENT_TOKEN", "CLIENT_KEY", "DEV_SERVER_ID"]);
