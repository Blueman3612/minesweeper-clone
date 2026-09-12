import { expect, test } from "@playwright/test";
import { DIFFICULTIES, toIndex } from "../../src/lib/minesweeper";
import { boardAfterFirstClick, cascadeFrom, cell, coordsOf, openGame, readCells } from "./helpers";

const FIRST = { row: 4, col: 4 };

test("left click reveals a numbered cell without cascading", async ({ page }) => {
  const seed = 42;
  await openGame(page, "beginner", seed);
  const board = boardAfterFirstClick("beginner", seed, FIRST);
  const opened = cascadeFrom(board, FIRST);
  await cell(page, FIRST).click();

  // Pick a safe numbered cell the first cascade did not touch.
  const target = coordsOf(opened, (i) => {
    const c = opened.cells[i];
    return !c.mine && !c.revealed && c.adjacent > 0;
  })[0];
  expect(target).toBeDefined();
  const expectedValue = board.cells[toIndex(board.cols, target.row, target.col)].adjacent;

  const before = (await readCells(page)).filter((c) => c.state === "revealed").length;
  await cell(page, target).click();

  const targetCell = cell(page, target);
  await expect(targetCell).toHaveAttribute("data-state", "revealed");
  await expect(targetCell).toHaveAttribute("data-value", String(expectedValue));
  await expect(targetCell).toHaveText(String(expectedValue));

  const after = (await readCells(page)).filter((c) => c.state === "revealed").length;
  expect(after).toBe(before + 1);
});

test("the clock starts on the first click and the counter shows the mine total", async ({ page }) => {
  await openGame(page, "intermediate", 7);
  await expect(page.getByTestId("timer")).toHaveText("000");
  await expect(page.getByTestId("mine-counter")).toHaveText(String(DIFFICULTIES.intermediate.mines).padStart(3, "0"));
  await expect(page.getByTestId("face")).toHaveAttribute("data-face", "idle");

  await cell(page, { row: 7, col: 7 }).click();
  await expect(page.getByTestId("game")).toHaveAttribute("data-status", "playing");
  await expect(page.getByTestId("timer")).not.toHaveText("000", { timeout: 3_000 });
  await expect(page.getByTestId("mine-counter")).toHaveText("040");
});

test("clicking a revealed cell changes nothing", async ({ page }) => {
  await openGame(page, "beginner", 42);
  await cell(page, FIRST).click();
  const before = await readCells(page);
  await cell(page, FIRST).click();
  await cell(page, FIRST).click();
  expect(await readCells(page)).toEqual(before);
});
