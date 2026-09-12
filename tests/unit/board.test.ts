import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  createBoard,
  mineIndices,
  mulberry32,
  neighborsOf,
  parseSeed,
  placeMines,
  toCoords,
  toIndex,
} from "@/lib/minesweeper";
import { seeds } from "./helpers";

describe("difficulties", () => {
  it("match the classic presets", () => {
    expect(DIFFICULTIES.beginner).toMatchObject({ rows: 9, cols: 9, mines: 10 });
    expect(DIFFICULTIES.intermediate).toMatchObject({ rows: 16, cols: 16, mines: 40 });
    expect(DIFFICULTIES.expert).toMatchObject({ rows: 16, cols: 30, mines: 99 });
  });
});

describe("neighborsOf", () => {
  it("clips to the board edges", () => {
    expect(neighborsOf(3, 3, 0).sort((a, b) => a - b)).toEqual([1, 3, 4]);
    expect(neighborsOf(3, 3, 4).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
    expect(neighborsOf(3, 3, 8).sort((a, b) => a - b)).toEqual([4, 5, 7]);
    expect(neighborsOf(1, 5, 2).sort((a, b) => a - b)).toEqual([1, 3]);
  });

  it("round-trips index and coordinates", () => {
    for (let i = 0; i < 16 * 30; i++) {
      const { row, col } = toCoords(30, i);
      expect(toIndex(30, row, col)).toBe(i);
    }
  });
});

describe("createBoard", () => {
  it("creates an all-hidden, mine-free board", () => {
    const board = createBoard(DIFFICULTIES.beginner);
    expect(board.cells).toHaveLength(81);
    expect(board.minesPlaced).toBe(false);
    expect(board.cells.every((c) => !c.mine && !c.revealed && c.mark === "none")).toBe(true);
  });

  it("rejects impossible mine counts", () => {
    expect(() => createBoard({ rows: 2, cols: 2, mines: 4 })).toThrow();
  });
});

describe("placeMines", () => {
  it("is deterministic for a given seed and first click", () => {
    const a = placeMines(createBoard(DIFFICULTIES.expert), mulberry32(42), 100);
    const b = placeMines(createBoard(DIFFICULTIES.expert), mulberry32(42), 100);
    expect(mineIndices(a)).toEqual(mineIndices(b));
  });

  it("varies with the seed", () => {
    const a = placeMines(createBoard(DIFFICULTIES.beginner), mulberry32(1), 40);
    const b = placeMines(createBoard(DIFFICULTIES.beginner), mulberry32(2), 40);
    expect(mineIndices(a)).not.toEqual(mineIndices(b));
  });

  it("keeps the first click and its neighbors clear, with correct counts, across many seeds", () => {
    for (const key of DIFFICULTY_ORDER) {
      const difficulty = DIFFICULTIES[key];
      const total = difficulty.rows * difficulty.cols;
      for (const seed of seeds(60)) {
        const rng = mulberry32(seed);
        const safeIndex = Math.floor(rng() * total);
        const board = placeMines(createBoard(difficulty), mulberry32(seed), safeIndex);

        expect(board.minesPlaced).toBe(true);
        expect(mineIndices(board)).toHaveLength(difficulty.mines);

        const safeZone = [safeIndex, ...neighborsOf(difficulty.rows, difficulty.cols, safeIndex)];
        for (const i of safeZone) expect(board.cells[i].mine).toBe(false);

        for (let i = 0; i < total; i++) {
          const expected = neighborsOf(difficulty.rows, difficulty.cols, i).filter(
            (n) => board.cells[n].mine,
          ).length;
          expect(board.cells[i].adjacent).toBe(expected);
        }
      }
    }
  });

  it("falls back to protecting only the clicked cell on tiny boards", () => {
    // 3x3 with 7 mines leaves exactly 2 safe cells, so the neighbor ring cannot be spared.
    const board = placeMines(createBoard({ rows: 3, cols: 3, mines: 7 }), mulberry32(7), 4);
    expect(board.cells[4].mine).toBe(false);
    expect(mineIndices(board)).toHaveLength(7);
  });

  it("does not touch marks already on the board", () => {
    const empty = createBoard(DIFFICULTIES.beginner);
    const cells = empty.cells.slice();
    cells[3] = { ...cells[3], mark: "flag" };
    const board = placeMines({ ...empty, cells }, mulberry32(5), 40);
    expect(board.cells[3].mark).toBe("flag");
  });
});

describe("parseSeed", () => {
  it("accepts 32-bit unsigned integers only", () => {
    expect(parseSeed("42")).toBe(42);
    expect(parseSeed("0")).toBe(0);
    expect(parseSeed("4294967295")).toBe(4294967295);
    expect(parseSeed("4294967296")).toBeNull();
    expect(parseSeed("-1")).toBeNull();
    expect(parseSeed("1.5")).toBeNull();
    expect(parseSeed("abc")).toBeNull();
    expect(parseSeed("")).toBeNull();
    expect(parseSeed(null)).toBeNull();
  });
});
