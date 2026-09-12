import type { Rng } from "./rng";
import type { Board, Cell, Difficulty } from "./types";

export function toIndex(cols: number, row: number, col: number): number {
  return row * cols + col;
}

export function toCoords(cols: number, index: number): { row: number; col: number } {
  return { row: Math.floor(index / cols), col: index % cols };
}

/** Indices of the up to 8 cells surrounding `index`, clipped to the board. */
export function neighborsOf(rows: number, cols: number, index: number): number[] {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    const r = row + dr;
    if (r < 0 || r >= rows) continue;
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const c = col + dc;
      if (c < 0 || c >= cols) continue;
      out.push(r * cols + c);
    }
  }
  return out;
}

export function createBoard(
  difficulty: Pick<Difficulty, "rows" | "cols" | "mines">,
): Board {
  const { rows, cols, mines } = difficulty;
  if (mines >= rows * cols) throw new Error("Board cannot hold that many mines");
  const cells: Cell[] = Array.from({ length: rows * cols }, () => ({
    mine: false,
    adjacent: 0,
    revealed: false,
    mark: "none",
  }));
  return { rows, cols, mines, minesPlaced: false, cells };
}

/**
 * Place `board.mines` mines using `rng`, keeping `safeIndex` and its neighbors clear so the
 * first click always opens an area. Falls back to protecting only the clicked cell when the
 * board is too small for the full safe zone. Also computes adjacency counts.
 */
export function placeMines(board: Board, rng: Rng, safeIndex: number): Board {
  const total = board.rows * board.cols;
  if (safeIndex < 0 || safeIndex >= total) throw new RangeError("safeIndex out of range");
  let safe = new Set<number>([safeIndex, ...neighborsOf(board.rows, board.cols, safeIndex)]);
  if (total - safe.size < board.mines) safe = new Set([safeIndex]);
  if (total - safe.size < board.mines) throw new Error("Board cannot hold that many mines");

  const candidates: number[] = [];
  for (let i = 0; i < total; i++) if (!safe.has(i)) candidates.push(i);

  // Partial Fisher-Yates shuffle: the first `mines` entries become mine positions.
  for (let i = 0; i < board.mines; i++) {
    const j = i + Math.floor(rng() * (candidates.length - i));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  const mineSet = new Set(candidates.slice(0, board.mines));

  const cells: Cell[] = board.cells.map((cell, i) => ({
    ...cell,
    mine: mineSet.has(i),
    adjacent: 0,
  }));
  for (const m of mineSet) {
    for (const n of neighborsOf(board.rows, board.cols, m)) cells[n].adjacent++;
  }
  return { ...board, minesPlaced: true, cells };
}

export function mineIndices(board: Board): number[] {
  const out: number[] = [];
  board.cells.forEach((cell, i) => {
    if (cell.mine) out.push(i);
  });
  return out;
}
