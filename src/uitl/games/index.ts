import { Snowflake } from "discord.js";

enum GameState {
  Waiting,
  InProgress,
  Ended,
}

export abstract class Game<P, T> {
  public abstract data: T;
  public playerdata: Record<Snowflake, P> = {};
  public state = GameState.Waiting;

  public getPlayers(): Snowflake[] {
    return Object.keys(this.playerdata);
  }

  abstract getInitialPlayerData(player: Snowflake): P;
}
