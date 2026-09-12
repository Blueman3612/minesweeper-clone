import { expect, test } from "@playwright/test";
import { boardAfterFirstClick, cascadeFrom, cell, coordsOf, openGame, readCells } from "./helpers";

const FIRST = { row: 4, col: 4 };

test("right click cycles flag, question, clear and drives the mine counter", async ({ page }) => {
  await openGame(page, "beginner", 42);
  await cell(page, FIRST).click();
  const board = cascadeFrom(boardAfterFirstClick("beginner", 42, FIRST), FIRST);
  const hidden = coordsOf(board, (i) => !board.cells[i].revealed);
  const [a, b] = hidden;

  const counter = page.getByTestId("mine-counter");
  await expect(counter).toHaveText("010");

  await cell(page, a).click({ button: "right" });
  await expect(cell(page, a)).toHaveAttribute("data-state", "flagged");
  await expect(counter).toHaveText("009");

  await cell(page, b).click({ button: "right" });
  await expect(counter).toHaveText("008");

  await cell(page, a).click({ button: "right" });
  await expect(cell(page, a)).toHaveAttribute("data-state", "question");
  await expect(counter).toHaveText("009");

  await cell(page, a).click({ button: "right" });
  await expect(cell(page, a)).toHaveAttribute("data-state", "hidden");
  await expect(counter).toHaveText("009");
});

test("a flagged cell ignores left clicks, a question mark does not", async ({ page }) => {
  await openGame(page, "beginner", 42);
  await cell(page, FIRST).click();
  const board = cascadeFrom(boardAfterFirstClick("beginner", 42, FIRST), FIRST);
  const safeHidden = coordsOf(board, (i) => !board.cells[i].revealed && !board.cells[i].mine);
  const flagged = safeHidden[0];
  const questioned = safeHidden[1];

  await cell(page, flagged).click({ button: "right" });
  await cell(page, flagged).click();
  await expect(cell(page, flagged)).toHaveAttribute("data-state", "flagged");

  await cell(page, questioned).click({ button: "right" });
  await cell(page, questioned).click({ button: "right" });
  await expect(cell(page, questioned)).toHaveAttribute("data-state", "question");
  await cell(page, questioned).click();
  await expect(cell(page, questioned)).toHaveAttribute("data-state", "revealed");
});

test("flags can be placed before the first click without starting the clock", async ({ page }) => {
  await openGame(page, "expert", 5);
  await cell(page, { row: 0, col: 0 }).click({ button: "right" });
  await cell(page, { row: 15, col: 29 }).click({ button: "right" });
  await expect(page.getByTestId("mine-counter")).toHaveText("097");
  await expect(page.getByTestId("game")).toHaveAttribute("data-status", "ready");
  await page.waitForTimeout(1_200);
  await expect(page.getByTestId("timer")).toHaveText("000");
  expect((await readCells(page)).filter((c) => c.state === "flagged")).toHaveLength(2);
});

test("over-flagging drives the counter negative", async ({ page }) => {
  await openGame(page, "beginner", 42);
  for (let col = 0; col < 9; col++) await cell(page, { row: 0, col }).click({ button: "right" });
  for (let col = 0; col < 3; col++) await cell(page, { row: 8, col }).click({ button: "right" });
  await expect(page.getByTestId("mine-counter")).toHaveText("-02");
});
