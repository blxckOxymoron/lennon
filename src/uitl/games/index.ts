import { ThreadChannel, User } from "discord.js";
import { ClickGame } from "./click";
import { DiscordGame } from "./discordgame";
import { TicTacToe } from "./tictactoe";

export enum GamePhase {
  Waiting = "waiting",
  Running = "running",
  Ended = "ended",
}

//TODO change this to interface and properties to classes
export enum MoveError {
  InvalidMove = "games/error:invalid_move",
  InvalidPlayer = "games/error:invalid_player",
  GameNotRunning = "games/error:game_not_running",
  NotInGame = "games/error:not_in_game",
  Custom = "games/error:custom",
}

export type ErrorOrMessage = { error: MoveError } | { error: MoveError.Custom; messageKey: string };

export * from "./basegame";
export * from "./discordgame";
export { default as GameManager } from "./manager";

export type DiscordGameImpl = new (channel: ThreadChannel, creator: User) => DiscordGame<
  any,
  any,
  any
>;

export const discordGames: Record<string, DiscordGameImpl> = {
  ClickGame,
  TicTacToe,
};
