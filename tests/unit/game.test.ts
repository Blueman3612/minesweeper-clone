import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  createGame,
  elapsedMs,
  gameReducer,
  mineIndices,
  mulberry32,
  remainingMines,
  type GameState,
} from "@/lib/minesweeper";
import { seeds } from "./helpers";

function revealAt(state: GameState, index: number, at = 1_000): GameState {
  return gameReducer(state, { type: "reveal", index, at });
}

function winGame(state: GameState, first: number): GameState {
  let s = revealAt(state, first, 1_000);
  const mines = new Set(mineIndices(s.board));
  for (let i = 0; i < s.board.cells.length && s.status !== "won"; i++) {
    if (mines.has(i)) continue;
    s = revealAt(s, i, 1_000 + i);
  }
  return s;
}

describe("game reducer", () => {
  it("starts ready with no mines and no clock", () => {
    const state = createGame("beginner", 7);
    expect(state.status).toBe("ready");
    expect(state.board.minesPlaced).toBe(false);
    expect(elapsedMs(state, 5_000)).toBe(0);
    expect(remainingMines(state)).toBe(10);
  });

  it("first reveal is always safe and starts the clock", () => {
    for (const key of DIFFICULTY_ORDER) {
      const total = DIFFICULTIES[key].rows * DIFFICULTIES[key].cols;
      for (const seed of seeds(40, 500)) {
        const index = Math.floor(mulberry32(seed ^ 0xabcdef)() * total);
        const state = revealAt(createGame(key, seed), index, 12_345);
        expect(state.status).not.toBe("lost");
        expect(state.board.minesPlaced).toBe(true);
        expect(state.board.cells[index].revealed).toBe(true);
        expect(state.board.cells[index].mine).toBe(false);
        expect(state.startedAt).toBe(12_345);
        expect(state.endedAt).toBeNull();
        expect(elapsedMs(state, 15_345)).toBe(3_000);
      }
    }
  });

  it("uses the seed deterministically", () => {
    const a = revealAt(createGame("expert", 99), 200);
    const b = revealAt(createGame("expert", 99), 200);
    expect(mineIndices(a.board)).toEqual(mineIndices(b.board));
  });

  it("does not place mines when the first click lands on a flag", () => {
    const flagged = gameReducer(createGame("beginner", 3), { type: "cycleMark", index: 10 });
    const same = revealAt(flagged, 10);
    expect(same).toBe(flagged);
    expect(same.board.minesPlaced).toBe(false);
  });

  it("allows flagging before the first click and counts remaining mines", () => {
    let state = createGame("beginner", 3);
    state = gameReducer(state, { type: "cycleMark", index: 0 });
    state = gameReducer(state, { type: "cycleMark", index: 1 });
    expect(remainingMines(state)).toBe(8);
    state = gameReducer(state, { type: "cycleMark", index: 1 }); // now question
    expect(remainingMines(state)).toBe(9);
    // Over-flagging goes negative.
    for (let i = 2; i < 14; i++) state = gameReducer(state, { type: "cycleMark", index: i });
    expect(remainingMines(state)).toBe(-3);
  });

  it("loses on a mine: exploded index set, all mines exposed, clock frozen", () => {
    const started = revealAt(createGame("intermediate", 11), 0, 1_000);
    const mine = mineIndices(started.board)[0];
    const lost = revealAt(started, mine, 4_500);
    expect(lost.status).toBe("lost");
    expect(lost.explodedIndex).toBe(mine);
    expect(lost.endedAt).toBe(4_500);
    expect(elapsedMs(lost, 99_000)).toBe(3_500);
    for (const cell of lost.board.cells) if (cell.mine) expect(cell.revealed || cell.mark === "flag").toBe(true);
    // Further input is ignored.
    expect(revealAt(lost, 5)).toBe(lost);
    expect(gameReducer(lost, { type: "cycleMark", index: 5 })).toBe(lost);
  });

  it("keeps flagged mines flagged and wrong flags in place on loss", () => {
    let state = revealAt(createGame("beginner", 21), 40, 1_000);
    const mines = mineIndices(state.board);
    const safe = state.board.cells.findIndex((c) => !c.mine && !c.revealed);
    state = gameReducer(state, { type: "cycleMark", index: mines[0] });
    state = gameReducer(state, { type: "cycleMark", index: safe });
    const lost = revealAt(state, mines[1], 2_000);
    expect(lost.board.cells[mines[0]]).toMatchObject({ mark: "flag", revealed: false });
    expect(lost.board.cells[safe]).toMatchObject({ mark: "flag", revealed: false, mine: false });
  });

  it("wins when every safe cell is revealed and flags the rest", () => {
    for (const seed of seeds(10, 77)) {
      const won = winGame(createGame("beginner", seed), 40);
      expect(won.status).toBe("won");
      expect(won.endedAt).not.toBeNull();
      expect(remainingMines(won)).toBe(0);
      for (const cell of won.board.cells) {
        if (cell.mine) expect(cell).toMatchObject({ revealed: false, mark: "flag" });
        else expect(cell.revealed).toBe(true);
      }
      expect(revealAt(won, 0)).toBe(won);
    }
  });

  it("reset returns to a fresh ready state with the new seed", () => {
    const won = winGame(createGame("beginner", 5), 40);
    const fresh = gameReducer(won, { type: "reset", seed: 6 });
    expect(fresh).toMatchObject({ status: "ready", seed: 6, startedAt: null, endedAt: null });
    expect(fresh.board.minesPlaced).toBe(false);
  });
});
