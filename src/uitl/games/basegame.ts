import { Awaitable } from "discord.js";
import { GamePhase, ErrorOrMessage, MoveError } from "./index";

// game should be independent from platform

export abstract class Game<PlayerData, State, MoveData, Player = string> {
  public abstract data: State;
  public abstract name: string;

  public playerdata: Record<string, PlayerData> = {} as any; //? why do i need "as any" here?
  public phase = GamePhase.Waiting;
  public timestamps: Record<GamePhase, number> = {
    waiting: Date.now(),
    running: 0,
    ended: 0,
  };

  private upNowIndex = 0;

  public get playerIdsInOrder(): string[] {
    const tail = [...this.playerIds];
    const head = tail.splice(0, this.upNowIndex);
    return [...tail, ...head];
  }

  public get playerInTurnId(): string {
    return this.playerIdsInOrder[this.upNowIndex] ?? "no player in turn";
  }

  public get playerIds(): string[] {
    return Object.keys(this.playerdata);
  }

  public get canPlayersJoin(): boolean {
    return this.phase === GamePhase.Waiting;
  }

  public async getDataFor(player: Player): Promise<PlayerData | ErrorOrMessage> {
    return (
      this.playerdata[await this.getIdFor(player)] ?? {
        error: MoveError.NotInGame,
      }
    );
  }

  public incrementUpNow(by = 1) {
    this.upNowIndex += by;
    this.upNowIndex %= this.playerIds.length;
  }

  public async start() {
    if (this.phase !== GamePhase.Waiting) return;
    this.phase = GamePhase.Running;
    this.timestamps.running = Date.now();
  }

  public async end() {
    if (this.phase !== GamePhase.Running) return;
    this.phase = GamePhase.Ended;
    this.timestamps.ended = Date.now();
  }

  public async makeMove(player: Player, move: MoveData): Promise<ErrorOrMessage | void> {
    if (this.phase !== GamePhase.Running) return { error: MoveError.GameNotRunning };

    const id = await this.getIdFor(player);

    if (!this.playerIds.includes(id)) return { error: MoveError.NotInGame };

    if (this.playerInTurnId !== id) return { error: MoveError.InvalidPlayer };

    return this.handleMove(player, move);
  }

  abstract handleMove(player: Player, move: MoveData): Awaitable<ErrorOrMessage | void>;
  abstract getIdFor(player: Player): Awaitable<string>;
  abstract getPlayerFor(id: string): Awaitable<Player>;
  abstract getInitialPlayerData(player: Player): Awaitable<PlayerData>;

  public async playerJoin(player: Player): Promise<boolean> {
    if (!this.canPlayersJoin) return false;

    const id = await this.getIdFor(player);
    this.playerdata[id] = await this.getInitialPlayerData(player);
    return true;
  }

  public async playerLeave(player: Player): Promise<boolean> {
    const wasInGame = this.playerIds.includes(await this.getIdFor(player));

    delete this.playerdata[await this.getIdFor(player)];
    this.upNowIndex %= this.playerIds.length;

    return wasInGame;
  }
}
