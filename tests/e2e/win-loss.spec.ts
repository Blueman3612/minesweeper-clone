import { expect, test } from "@playwright/test";
import { boardAfterFirstClick, cascadeFrom, cell, clearBoard, coordsOf, domCellAt, mines, openGame, readCells } from "./helpers";

const FIRST = { row: 4, col: 4 };
const SHOT_DIR = process.env.E2E_SHOT_DIR;

test("clicking a mine loses: exploded cell, all mines exposed, wrong flags marked, input frozen", async ({ page }) => {
  const seed = 42;
  await openGame(page, "beginner", seed);
  await cell(page, FIRST).click();
  const board = cascadeFrom(boardAfterFirstClick("beginner", seed, FIRST), FIRST);
  const allMines = mines(board);
  const [flaggedMine, exploded] = allMines;
  const wrongFlag = coordsOf(board, (i) => !board.cells[i].revealed && !board.cells[i].mine)[0];

  await cell(page, flaggedMine).click({ button: "right" });
  await cell(page, wrongFlag).click({ button: "right" });
  await cell(page, exploded).click();

  const game = page.getByTestId("game");
  await expect(game).toHaveAttribute("data-status", "lost");
  await expect(page.getByTestId("face")).toHaveAttribute("data-face", "lost");
  await expect(page.getByTestId("status")).toContainText("Boom");
  await expect(cell(page, exploded)).toHaveAttribute("data-state", "exploded");
  await expect(cell(page, flaggedMine)).toHaveAttribute("data-state", "flagged");
  await expect(cell(page, wrongFlag)).toHaveAttribute("data-state", "wrong-flag");

  const dom = await readCells(page);
  for (const m of allMines) {
    const s = domCellAt(dom, m, board.cols).state;
    expect(["mine", "exploded", "flagged"], `mine ${m.row},${m.col}`).toContain(s);
  }
  // No safe cell was opened by the loss.
  for (const c of dom) {
    if (c.state === "revealed") expect(board.cells[c.row * board.cols + c.col].mine).toBe(false);
  }

  // Frozen: further clicks and right clicks do nothing, clock stops.
  const frozenTimer = await page.getByTestId("timer").textContent();
  const hiddenLeft = coordsOf(board, (i) => !board.cells[i].revealed && !board.cells[i].mine)[1];
  await cell(page, hiddenLeft).click();
  await cell(page, hiddenLeft).click({ button: "right" });
  await expect(cell(page, hiddenLeft)).toHaveAttribute("data-state", "hidden");
  await page.waitForTimeout(1_200);
  await expect(page.getByTestId("timer")).toHaveText(frozenTimer ?? "");
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/loss.png` });

  // The face starts a fresh round.
  await page.getByTestId("face").click();
  await expect(game).toHaveAttribute("data-status", "ready");
  await expect(page.getByTestId("timer")).toHaveText("000");
  await expect(page.getByTestId("mine-counter")).toHaveText("010");
  expect((await readCells(page)).every((c) => c.state === "hidden")).toBe(true);
});

test("revealing every safe cell wins: mines auto-flagged, counter zero, clock frozen", async ({ page }) => {
  const seed = 42;
  await openGame(page, "beginner", seed);
  await cell(page, FIRST).click();
  const board = boardAfterFirstClick("beginner", seed, FIRST);
  await clearBoard(page, board);

  const game = page.getByTestId("game");
  await expect(game).toHaveAttribute("data-status", "won");
  await expect(page.getByTestId("face")).toHaveAttribute("data-face", "won");
  await expect(page.getByTestId("mine-counter")).toHaveText("000");
  await expect(page.getByTestId("status")).toContainText(/^Cleared in \d+\.\ds\./);

  const dom = await readCells(page);
  for (const c of dom) {
    const isMine = board.cells[c.row * board.cols + c.col].mine;
    expect(c.state, `cell ${c.row},${c.col}`).toBe(isMine ? "flagged" : "revealed");
  }

  const frozenTimer = await page.getByTestId("timer").textContent();
  await page.waitForTimeout(1_200);
  await expect(page.getByTestId("timer")).toHaveText(frozenTimer ?? "");
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/win.png` });
});

test("a win on a bigger field is detected too", async ({ page }) => {
  const seed = 2024;
  const first = { row: 8, col: 8 };
  await openGame(page, "intermediate", seed);
  await cell(page, first).click();
  await clearBoard(page, boardAfterFirstClick("intermediate", seed, first));
  await expect(page.getByTestId("game")).toHaveAttribute("data-status", "won");
  await expect(page.getByTestId("mine-counter")).toHaveText("000");
});
