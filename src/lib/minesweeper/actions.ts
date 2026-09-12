import { neighborsOf } from "./board";
import type { Board, Cell, CellMark } from "./types";

export interface RevealResult {
  board: Board;
  hitMine: boolean;
  /** Indices newly revealed by this action, in reveal order. */
  revealed: number[];
}

/**
 * Reveal a cell. Revealed and flagged cells are no-ops. Revealing a zero cell flood-fills
 * outward through connected zero cells and reveals their numbered border. Flagged cells are
 * never opened by the cascade; question marks are.
 */
export function reveal(board: Board, index: number): RevealResult {
  const start = board.cells[index];
  if (!start || start.revealed || start.mark === "flag") {
    return { board, hitMine: false, revealed: [] };
  }
  const cells = board.cells.slice();
  if (start.mine) {
    cells[index] = { ...start, revealed: true, mark: "none" };
    return { board: { ...board, cells }, hitMine: true, revealed: [index] };
  }

  const revealed: number[] = [];
  const stack = [index];
  while (stack.length > 0) {
    const i = stack.pop() as number;
    const cell = cells[i];
    if (cell.revealed || cell.mark === "flag" || cell.mine) continue;
    cells[i] = { ...cell, revealed: true, mark: "none" };
    revealed.push(i);
    if (cell.adjacent === 0) {
      for (const n of neighborsOf(board.rows, board.cols, i)) {
        if (!cells[n].revealed) stack.push(n);
      }
    }
  }
  return { board: { ...board, cells }, hitMine: false, revealed };
}

const NEXT_MARK: Record<CellMark, CellMark> = {
  none: "flag",
  flag: "question",
  question: "none",
};

/** Cycle a hidden cell's mark: none -> flag -> question -> none. Revealed cells are no-ops. */
export function cycleMark(board: Board, index: number): Board {
  const cell = board.cells[index];
  if (!cell || cell.revealed) return board;
  const cells = board.cells.slice();
  cells[index] = { ...cell, mark: NEXT_MARK[cell.mark] };
  return { ...board, cells };
}

export function countRevealed(board: Board): number {
  let n = 0;
  for (const cell of board.cells) if (cell.revealed) n++;
  return n;
}

export function countFlags(board: Board): number {
  let n = 0;
  for (const cell of board.cells) if (cell.mark === "flag") n++;
  return n;
}

export function safeCellsRemaining(board: Board): number {
  return board.rows * board.cols - board.mines - countRevealed(board);
}

/** True when every non-mine cell has been revealed. */
export function isCleared(board: Board): boolean {
  return board.minesPlaced && safeCellsRemaining(board) === 0;
}

/** Loss presentation: expose every unflagged mine. Flags stay so wrong ones can be shown. */
export function revealAllMines(board: Board): Board {
  const cells: Cell[] = board.cells.map((cell) =>
    cell.mine && cell.mark !== "flag" ? { ...cell, revealed: true, mark: "none" } : cell,
  );
  return { ...board, cells };
}

/** Win presentation: flag every remaining mine so the counter reads zero. */
export function flagAllMines(board: Board): Board {
  const cells: Cell[] = board.cells.map((cell) =>
    cell.mine && !cell.revealed ? { ...cell, mark: "flag" } : cell,
  );
  return { ...board, cells };
}
