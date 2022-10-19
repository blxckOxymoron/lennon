import { container } from "@sapphire/framework";
import { ButtonInteraction, Message, MessageActionRow, MessageButton, User } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { ErrorOrMessage, MoveError, WithInteraction } from ".";
import { ThemedEmbeds } from "../embeds";
import { DiscordGame } from "./discordgame";

type Playerdata = {
  symbol: string;
};

type optId = string | undefined;

type State = {
  board: [[optId, optId, optId], [optId, optId, optId], [optId, optId, optId]];
  overview: Message | undefined;
};

type Move = {
  x: number;
  y: number;
};

export class TTTGame extends DiscordGame<Playerdata, State, Move> {
  public name: string = "TicTacToe";
  public override interactionPrefix: string = "ttt";
  public data: State = {
    board: [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ],
    overview: undefined,
  };

  public override async buttonHandler(interaction: ButtonInteraction) {
    const [x, y] = interaction.customId
      .split("_")[1]
      ?.split("-")
      .map(it => parseInt(it)) ?? [-1, -1]; // cant use parseInt directly in map because it returns NaN
    await this.makeMove(interaction.user, { interaction, x: x ?? -1, y: y ?? -1 });
  }

  async handleMove(player: User, move: WithInteraction<Move>): Promise<void | ErrorOrMessage> {
    const d = await this.getDataFor(player);
    if ("error" in d) return d;

    const { x, y } = move;

    if (x > 2 || y > 2) return { error: MoveError.InvalidMove };
    if (this.data.board[x]![y] !== undefined) return { error: MoveError.InvalidMove };

    this.data.board[x]![y] = this.getIdFor(player);

    const winner = this.checkWin();
    if (winner !== undefined) {
      this.end(player); // we could also use `this.getPlayerFor(winner)`
    }

    await this.updateOverview();
  }

  public override async start(): Promise<void> {
    super.start();
    this.updateOverview();
  }

  private async updateOverview(): Promise<void> {
    const overview = this.data.overview;
    const content = {
      embeds: [ThemedEmbeds.Primary("Tic Tac Toe")],
      components: [...(await this.getGameInterface())],
    };
    if (overview === undefined) this.data.overview = await this.channel.send(content);
    else await overview.edit(content);
  }

  public override playerJoin(player: User): Promise<boolean> {
    const didJoin = super.playerJoin(player);
    if (this.playerIds.length >= 2) this.start();
    return didJoin;
  }

  async getInitialPlayerData(_: User): Promise<Playerdata> {
    return {
      symbol: this.playerIds.length === 0 ? "❎" : "⭕",
    };
  }

  private checkWin(): optId {
    const board = this.data.board;
    for (let i = 0; i < 3; i++) {
      //* we can use `!` because i only ranges from 0 to 2
      if (board[i]![0] === board[i]![1] && board[i]![1] === board[i]![2]) return board[i]![0];
      if (board[0][i] === board[1][i] && board[1][i] === board[2][i]) return board[0][i]!;
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) return board[0][0];
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) return board[0][2];
    return undefined;
  }

  private async getGameInterface() {
    return await Promise.all(
      this.data.board.map(async (row, x) =>
        new MessageActionRow().addComponents(
          await Promise.all(
            row.map(async (cell, y) => {
              const label =
                cell === undefined
                  ? "🔳"
                  : await this.getDataFor(await this.getPlayerFor(cell)).then(d =>
                      "error" in d ? "🔲" : d.symbol
                    );

              return new MessageButton()
                .setCustomId(`ttt_${x}-${y}`)
                .setEmoji(label)
                .setStyle(MessageButtonStyles.PRIMARY);
            })
          )
        )
      )
    );
  }
}
