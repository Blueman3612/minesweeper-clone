import { expect, test } from "@playwright/test";
import { DIFFICULTIES, DIFFICULTY_ORDER } from "../../src/lib/minesweeper";
import { cell, openGame, status } from "./helpers";

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

for (const difficulty of DIFFICULTY_ORDER) {
  const { rows, cols } = DIFFICULTIES[difficulty];
  const corners = [
    { row: 0, col: 0 },
    { row: rows - 1, col: cols - 1 },
    { row: Math.floor(rows / 2), col: Math.floor(cols / 2) },
  ];

  test(`first click is always safe on ${difficulty}`, async ({ page }) => {
    for (const seed of SEEDS) {
      const first = corners[seed % corners.length];
      await openGame(page, difficulty, seed);
      await cell(page, first).click();
      expect(await status(page), `seed ${seed} at ${first.row},${first.col}`).toBe("playing");
      const clicked = cell(page, first);
      await expect(clicked).toHaveAttribute("data-state", "revealed");
      // Neighbors are kept clear too, so the opening cell always reads zero.
      await expect(clicked).toHaveAttribute("data-value", "0");
      await expect(page.getByTestId("face")).toHaveAttribute("data-face", "idle");
    }
  });
}
