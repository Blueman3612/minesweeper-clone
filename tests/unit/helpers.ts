import { type Board, type Cell, toIndex } from "@/lib/minesweeper";

/**
 * Build a board from a picture. `M` is a mine, `.` is safe. Optional second picture holds
 * marks: `F` flag, `?` question, `r` revealed, space or `.` for nothing.
 */
export function boardFromPicture(picture: string, marks?: string): Board {
  const rows = picture
    .trim()
    .split("\n")
    .map((line) => line.trim());
  const height = rows.length;
  const width = rows[0].length;
  const markRows = marks
    ? marks
        .trim()
        .split("\n")
        .map((line) => line.trim())
    : null;
  const cells: Cell[] = [];
  let mines = 0;
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const mine = rows[r][c] === "M";
      if (mine) mines++;
      const m = markRows?.[r]?.[c] ?? ".";
      cells.push({
        mine,
        adjacent: 0,
        revealed: m === "r",
        mark: m === "F" ? "flag" : m === "?" ? "question" : "none",
      });
    }
  }
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const i = toIndex(width, r, c);
      if (!cells[i].mine) continue;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = r + dr;
          const cc = c + dc;
          if (rr < 0 || rr >= height || cc < 0 || cc >= width) continue;
          cells[toIndex(width, rr, cc)].adjacent++;
        }
      }
    }
  }
  return { rows: height, cols: width, mines, minesPlaced: true, cells };
}

/** Render revealed cells as `r`, flags as `F`, questions as `?`, hidden as `.` for snapshot-style asserts. */
export function pictureOf(board: Board): string {
  const lines: string[] = [];
  for (let r = 0; r < board.rows; r++) {
    let line = "";
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[toIndex(board.cols, r, c)];
      line += cell.revealed ? "r" : cell.mark === "flag" ? "F" : cell.mark === "question" ? "?" : ".";
    }
    lines.push(line);
  }
  return lines.join("\n");
}

/** Deterministic integer sequence for fuzz loops. */
export function* seeds(count: number, start = 1): Generator<number> {
  for (let i = 0; i < count; i++) yield (start + i * 2654435761) >>> 0;
}
