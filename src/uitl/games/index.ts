import { ClickGame } from "./click";

export enum GameState {
  Waiting = "waiting",
  Running = "running",
  Ended = "ended",
}

//TODO change this to interface and properties to classes
export enum MoveError {
  InvalidMove = "games/errors:invalid_move",
  InvalidPlayer = "games/errors:invalid_player",
  GameNotRunning = "games/errors:game_not_running",
  NotInGame = "games/errors:not_in_game",
  Custom = "games/errors:custom",
}

export type ErrorOrMessage = { error: MoveError } | { error: MoveError.Custom; messageKey: string };

export * from "./basegame";
export * from "./discordgame";

const games = {
  ClickGame,
};

