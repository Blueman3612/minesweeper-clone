export type DifficultyKey = "beginner" | "intermediate" | "expert";

export interface Difficulty {
  key: DifficultyKey;
  label: string;
  rows: number;
  cols: number;
  mines: number;
}

/** Player-placed marker on a hidden cell. */
export type CellMark = "none" | "flag" | "question";

export interface Cell {
  mine: boolean;
  /** Number of mines in the 8 surrounding cells. Meaningless until mines are placed. */
  adjacent: number;
  revealed: boolean;
  mark: CellMark;
}

export interface Board {
  rows: number;
  cols: number;
  mines: number;
  /** Mines are placed lazily on the first reveal so that click is always safe. */
  minesPlaced: boolean;
  /** Row-major, index = row * cols + col. */
  cells: readonly Cell[];
}

export type GameStatus = "ready" | "playing" | "won" | "lost";

export interface GameState {
  difficulty: DifficultyKey;
  seed: number;
  board: Board;
  status: GameStatus;
  /** Epoch ms of the first reveal, null before the game starts. */
  startedAt: number | null;
  /** Epoch ms when the game was won or lost. */
  endedAt: number | null;
  /** Index of the mine that was clicked, set only on loss. */
  explodedIndex: number | null;
}

export type GameAction =
  | { type: "reveal"; index: number; at: number }
  | { type: "cycleMark"; index: number }
  | { type: "reset"; seed: number };
