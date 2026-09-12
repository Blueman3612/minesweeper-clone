import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  countRevealed,
  createBoard,
  cycleMark,
  isCleared,
  mulberry32,
  neighborsOf,
  placeMines,
  reveal,
  toIndex,
} from "@/lib/minesweeper";
import { boardFromPicture, pictureOf, seeds } from "./helpers";

describe("reveal", () => {
  it("opens a single numbered cell without cascading", () => {
    const board = boardFromPicture(`
      M....
      .....
      .....
    `);
    const { board: next, hitMine, revealed } = reveal(board, toIndex(5, 1, 1));
    expect(hitMine).toBe(false);
    expect(revealed).toEqual([toIndex(5, 1, 1)]);
    expect(pictureOf(next)).toBe(["....", ".r...", "....."].map((s) => s.padEnd(5, ".")).join("\n"));
  });

  it("flood-fills a zero region and its numbered border", () => {
    const board = boardFromPicture(`
      ....M
      .....
      .....
      M....
    `);
    const { board: next, revealed } = reveal(board, toIndex(5, 1, 2));
    // Every non-mine cell is connected through zeros here, so all 18 safe cells open.
    expect(revealed).toHaveLength(18);
    expect(pictureOf(next)).toBe(["rrrr.", "rrrrr", "rrrrr", ".rrrr"].join("\n"));
    expect(next.cells[toIndex(5, 0, 4)].revealed).toBe(false);
    expect(next.cells[toIndex(5, 3, 0)].revealed).toBe(false);
  });

  it("stops the cascade at numbers", () => {
    const board = boardFromPicture(`
      ...M...
      ...M...
      ...M...
    `);
    const { board: next } = reveal(board, 0);
    expect(pictureOf(next)).toBe(["rrr....", "rrr....", "rrr...."].join("\n"));
  });

  it("does not open flagged cells but does open question marks during the cascade", () => {
    const board = boardFromPicture(
      `
      .....
      .....
      .....
      `,
      `
      ..F..
      ..?..
      .....
      `,
    );
    const { board: next } = reveal(board, toIndex(5, 2, 0));
    expect(next.cells[toIndex(5, 0, 2)].revealed).toBe(false);
    expect(next.cells[toIndex(5, 0, 2)].mark).toBe("flag");
    expect(next.cells[toIndex(5, 1, 2)].revealed).toBe(true);
    expect(next.cells[toIndex(5, 1, 2)].mark).toBe("none");
    expect(countRevealed(next)).toBe(14);
  });

  it("is a no-op on flagged and already revealed cells", () => {
    const board = boardFromPicture(`
      M..
      ...
    `);
    const flagged = cycleMark(board, 1);
    expect(reveal(flagged, 1).board).toBe(flagged);
    expect(reveal(flagged, 1).revealed).toEqual([]);

    const opened = reveal(board, 1).board;
    expect(reveal(opened, 1).board).toBe(opened);
  });

  it("reports a mine hit and reveals only that mine", () => {
    const board = boardFromPicture(`
      M..
      ...
    `);
    const { board: next, hitMine, revealed } = reveal(board, 0);
    expect(hitMine).toBe(true);
    expect(revealed).toEqual([0]);
    expect(countRevealed(next)).toBe(1);
  });

  it("clears a question mark when the cell is clicked directly", () => {
    const board = boardFromPicture(`
      M..
      ...
    `);
    const marked = cycleMark(cycleMark(board, 1), 1);
    expect(marked.cells[1].mark).toBe("question");
    const { board: next } = reveal(marked, 1);
    expect(next.cells[1]).toMatchObject({ revealed: true, mark: "none" });
  });

  it("never touches the input board", () => {
    const board = boardFromPicture(`
      ...
      ...
    `);
    const before = JSON.stringify(board);
    reveal(board, 0);
    expect(JSON.stringify(board)).toBe(before);
  });
});

describe("cycleMark", () => {
  it("cycles none -> flag -> question -> none and ignores revealed cells", () => {
    const board = boardFromPicture(`
      M..
      ...
    `);
    const a = cycleMark(board, 2);
    const b = cycleMark(a, 2);
    const c = cycleMark(b, 2);
    expect(a.cells[2].mark).toBe("flag");
    expect(b.cells[2].mark).toBe("question");
    expect(c.cells[2].mark).toBe("none");

    const opened = reveal(board, 2).board;
    expect(cycleMark(opened, 2)).toBe(opened);
  });
});

describe("flood-fill invariants (fuzz)", () => {
  it("hold for random boards and random click sequences", () => {
    for (const key of DIFFICULTY_ORDER) {
      const difficulty = DIFFICULTIES[key];
      const total = difficulty.rows * difficulty.cols;
      for (const seed of seeds(25, 1000)) {
        const rng = mulberry32(seed);
        const first = Math.floor(rng() * total);
        let board = placeMines(createBoard(difficulty), rng, first);

        // Sprinkle some flags on non-mine cells to exercise the cascade barrier.
        for (let k = 0; k < 5; k++) {
          const i = Math.floor(rng() * total);
          if (!board.cells[i].mine) board = cycleMark(board, i);
        }

        for (let step = 0; step < 40; step++) {
          const i = Math.floor(rng() * total);
          if (board.cells[i].mine) continue;
          const before = countRevealed(board);
          const { board: next, hitMine, revealed } = reveal(board, i);
          expect(hitMine).toBe(false);
          // Monotonic: reveals only grow, by exactly the reported set.
          expect(countRevealed(next)).toBe(before + revealed.length);
          for (const r of revealed) expect(board.cells[r].revealed).toBe(false);
          board = next;

          for (let j = 0; j < total; j++) {
            const cell = board.cells[j];
            // Safety: no mine is ever revealed by a safe click.
            if (cell.mine) expect(cell.revealed).toBe(false);
            // Revealed cells carry no mark.
            if (cell.revealed) expect(cell.mark).toBe("none");
            // Closure: a revealed zero has every unflagged neighbor revealed.
            if (cell.revealed && cell.adjacent === 0) {
              for (const n of neighborsOf(difficulty.rows, difficulty.cols, j)) {
                const nb = board.cells[n];
                if (nb.mark !== "flag") expect(nb.revealed).toBe(true);
              }
            }
          }
          // isCleared is exactly "all safe cells revealed".
          expect(isCleared(board)).toBe(countRevealed(board) === total - difficulty.mines);
        }
      }
    }
  });
});
