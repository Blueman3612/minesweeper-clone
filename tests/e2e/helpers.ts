import { expect, type Locator, type Page } from "@playwright/test";
import {
  DIFFICULTIES,
  createBoard,
  mulberry32,
  placeMines,
  reveal,
  toIndex,
  type Board,
  type DifficultyKey,
} from "../../src/lib/minesweeper";

export interface Coord {
  row: number;
  col: number;
}

/** The exact board the app will build for this seed once `first` is clicked. Same code path as the reducer. */
export function boardAfterFirstClick(difficulty: DifficultyKey, seed: number, first: Coord): Board {
  const spec = DIFFICULTIES[difficulty];
  return placeMines(createBoard(spec), mulberry32(seed), toIndex(spec.cols, first.row, first.col));
}

export function coordsOf(board: Board, predicate: (i: number) => boolean): Coord[] {
  const out: Coord[] = [];
  for (let i = 0; i < board.cells.length; i++) {
    if (predicate(i)) out.push({ row: Math.floor(i / board.cols), col: i % board.cols });
  }
  return out;
}

export const mines = (board: Board) => coordsOf(board, (i) => board.cells[i].mine);
export const safeCells = (board: Board) => coordsOf(board, (i) => !board.cells[i].mine);

/** Cells the flood fill opens when `at` is clicked on `board`. */
export function cascadeFrom(board: Board, at: Coord): Board {
  return reveal(board, toIndex(board.cols, at.row, at.col)).board;
}

export function cell(page: Page, at: Coord): Locator {
  return page.getByTestId(`cell-${at.row}-${at.col}`);
}

export async function openGame(page: Page, difficulty: DifficultyKey, seed: number): Promise<void> {
  await page.goto(`/play?difficulty=${difficulty}&seed=${seed}`);
  await expect(page.getByTestId("game")).toHaveAttribute("data-status", "ready");
  await expect(page.getByTestId("board")).toBeVisible();
}

export interface DomCell {
  row: number;
  col: number;
  state: string;
  value: number | null;
}

/** Snapshot every cell's rendered state in one round trip. */
export async function readCells(page: Page): Promise<DomCell[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-testid^="cell-"]')).map((el) => ({
      row: Number(el.dataset.row),
      col: Number(el.dataset.col),
      state: el.dataset.state ?? "",
      value: el.dataset.value === undefined ? null : Number(el.dataset.value),
    })),
  );
}

export function domCellAt(cells: DomCell[], at: Coord, cols: number): DomCell {
  return cells[at.row * cols + at.col];
}

/** Left-click every safe cell that is still hidden. Ends the round in a win if the board matches. */
export async function clearBoard(page: Page, board: Board): Promise<void> {
  const snapshot = await readCells(page);
  for (const at of safeCells(board)) {
    if (domCellAt(snapshot, at, board.cols).state !== "hidden") continue;
    await cell(page, at).click();
  }
}

export async function status(page: Page): Promise<string> {
  return (await page.getByTestId("game").getAttribute("data-status")) ?? "";
}
