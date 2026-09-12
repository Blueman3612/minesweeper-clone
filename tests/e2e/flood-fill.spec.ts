import { expect, test } from "@playwright/test";
import { boardAfterFirstClick, cascadeFrom, cell, openGame, readCells, safeCells } from "./helpers";

test("the first click opens exactly the connected zero region and its numbered border", async ({ page }) => {
  const seed = 42;
  const first = { row: 4, col: 4 };
  await openGame(page, "beginner", seed);
  const expected = cascadeFrom(boardAfterFirstClick("beginner", seed, first), first);

  await cell(page, first).click();
  await expect(page.getByTestId("game")).toHaveAttribute("data-status", "playing");

  const dom = await readCells(page);
  expect(dom).toHaveLength(expected.cells.length);
  for (let i = 0; i < expected.cells.length; i++) {
    const want = expected.cells[i];
    const got = dom[i];
    if (want.revealed) {
      expect(got.state, `cell ${got.row},${got.col}`).toBe("revealed");
      expect(got.value, `cell ${got.row},${got.col}`).toBe(want.adjacent);
    } else {
      expect(got.state, `cell ${got.row},${got.col}`).toBe("hidden");
      expect(got.value).toBeNull();
    }
  }

  const opened = expected.cells.filter((c) => c.revealed).length;
  expect(opened).toBeGreaterThan(9); // more than the guaranteed safe 3x3, so the cascade actually ran
  const left = safeCells(expected).length - opened;
  await expect(page.getByTestId("status")).toHaveText(`${left} safe cells left`);
});

test("cascade across difficulties matches the engine", async ({ page }) => {
  for (const [difficulty, seed, first] of [
    ["intermediate", 1234, { row: 0, col: 0 }],
    ["expert", 99, { row: 15, col: 29 }],
  ] as const) {
    await openGame(page, difficulty, seed);
    const expected = cascadeFrom(boardAfterFirstClick(difficulty, seed, first), first);
    await cell(page, first).click();
    const dom = await readCells(page);
    const revealedDom = dom.filter((c) => c.state === "revealed").map((c) => c.row * expected.cols + c.col);
    const revealedWant = expected.cells.flatMap((c, i) => (c.revealed ? [i] : []));
    expect(revealedDom.sort((a, b) => a - b)).toEqual(revealedWant);
  }
});
