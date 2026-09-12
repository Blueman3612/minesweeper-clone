import { expect, test } from "@playwright/test";
import { BEST_TIMES_KEY } from "../../src/lib/bestTimes";
import { boardAfterFirstClick, cell, clearBoard, openGame } from "./helpers";

const FIRST = { row: 4, col: 4 };

async function winBeginner(page: Parameters<typeof openGame>[0], seed = 42) {
  await openGame(page, "beginner", seed);
  await cell(page, FIRST).click();
  await clearBoard(page, boardAfterFirstClick("beginner", seed, FIRST));
  await expect(page.getByTestId("game")).toHaveAttribute("data-status", "won");
}

async function storedTimes(page: Parameters<typeof openGame>[0]): Promise<Record<string, number>> {
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), BEST_TIMES_KEY);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => window.localStorage.removeItem(key), BEST_TIMES_KEY);
});

test("the first win is saved and shown on the menu, and survives a reload", async ({ page }) => {
  await expect(page.getByTestId("best-beginner")).toHaveText("No time yet");

  await winBeginner(page);
  await expect(page.getByTestId("status")).toContainText("First time saved.");
  const stored = await storedTimes(page);
  expect(typeof stored.beginner).toBe("number");
  expect(stored.beginner).toBeGreaterThan(0);
  expect(stored.intermediate).toBeUndefined();

  await page.getByRole("link", { name: "Menu" }).click();
  await expect(page.getByTestId("best-beginner")).toHaveText(/^\d+\.\ds$/);
  await expect(page.getByTestId("best-intermediate")).toHaveText("No time yet");
  await expect(page.getByTestId("best-expert")).toHaveText("No time yet");

  await page.reload();
  await expect(page.getByTestId("best-beginner")).toHaveText(/^\d+\.\ds$/);
  expect(await storedTimes(page)).toEqual(stored);
});

test("a slower win keeps the existing best", async ({ page }) => {
  await page.evaluate((key) => window.localStorage.setItem(key, JSON.stringify({ beginner: 100 })), BEST_TIMES_KEY);
  await winBeginner(page);
  await expect(page.getByTestId("status")).toContainText("Best 0.1s.");
  expect((await storedTimes(page)).beginner).toBe(100);
  await page.goto("/");
  await expect(page.getByTestId("best-beginner")).toHaveText("0.1s");
});

test("a faster win replaces the existing best", async ({ page }) => {
  await page.evaluate(
    (key) => window.localStorage.setItem(key, JSON.stringify({ beginner: 3_600_000, expert: 5_000 })),
    BEST_TIMES_KEY,
  );
  await winBeginner(page);
  await expect(page.getByTestId("status")).toContainText("New best!");
  const stored = await storedTimes(page);
  expect(stored.beginner).toBeLessThan(3_600_000);
  expect(stored.expert).toBe(5_000);
  await page.goto("/");
  await expect(page.getByTestId("best-expert")).toHaveText("5.0s");
});

test("corrupt storage is ignored, not fatal", async ({ page }) => {
  await page.evaluate((key) => window.localStorage.setItem(key, "{not json"), BEST_TIMES_KEY);
  await page.reload();
  await expect(page.getByTestId("best-beginner")).toHaveText("No time yet");
  await winBeginner(page);
  await expect(page.getByTestId("status")).toContainText("First time saved.");
});
