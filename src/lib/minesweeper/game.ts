import {
  countFlags,
  cycleMark,
  flagAllMines,
  isCleared,
  reveal,
  revealAllMines,
} from "./actions";
import { createBoard, placeMines } from "./board";
import { DIFFICULTIES } from "./difficulties";
import { mulberry32 } from "./rng";
import type { DifficultyKey, GameAction, GameState } from "./types";

export function createGame(difficulty: DifficultyKey, seed: number): GameState {
  return {
    difficulty,
    seed,
    board: createBoard(DIFFICULTIES[difficulty]),
    status: "ready",
    startedAt: null,
    endedAt: null,
    explodedIndex: null,
  };
}

export function isOver(state: GameState): boolean {
  return state.status === "won" || state.status === "lost";
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "reset":
      return createGame(state.difficulty, action.seed);

    case "cycleMark": {
      if (isOver(state)) return state;
      const board = cycleMark(state.board, action.index);
      return board === state.board ? state : { ...state, board };
    }

    case "reveal": {
      if (isOver(state)) return state;
      const target = state.board.cells[action.index];
      if (!target || target.revealed || target.mark === "flag") return state;

      let board = state.board;
      let startedAt = state.startedAt;
      if (!board.minesPlaced) {
        board = placeMines(board, mulberry32(state.seed), action.index);
        startedAt = action.at;
      }

      const result = reveal(board, action.index);
      if (result.hitMine) {
        return {
          ...state,
          board: revealAllMines(result.board),
          status: "lost",
          startedAt,
          endedAt: action.at,
          explodedIndex: action.index,
        };
      }
      if (isCleared(result.board)) {
        return {
          ...state,
          board: flagAllMines(result.board),
          status: "won",
          startedAt,
          endedAt: action.at,
        };
      }
      return { ...state, board: result.board, status: "playing", startedAt };
    }
  }
}

/** Milliseconds on the clock at `now`. Frozen at endedAt once the game is over. */
export function elapsedMs(state: GameState, now: number): number {
  if (state.startedAt == null) return 0;
  const end = state.endedAt ?? now;
  return Math.max(0, end - state.startedAt);
}

/** Mines minus flags placed. Can go negative if the player over-flags. */
export function remainingMines(state: GameState): number {
  return state.board.mines - countFlags(state.board);
}
