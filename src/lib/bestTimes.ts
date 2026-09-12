import { DIFFICULTY_ORDER, isDifficultyKey } from "./minesweeper/difficulties";
import type { DifficultyKey } from "./minesweeper/types";

/** Best completion time per difficulty, in milliseconds. */
export type BestTimes = Partial<Record<DifficultyKey, number>>;

export const BEST_TIMES_KEY = "minesweeper:bestTimes";

/** The subset of the Storage API this module needs, so it can be tested without a DOM. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadBestTimes(storage: StorageLike): BestTimes {
  let raw: string | null = null;
  try {
    raw = storage.getItem(BEST_TIMES_KEY);
  } catch {
    return {};
  }
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  const times: BestTimes = {};
  for (const key of DIFFICULTY_ORDER) {
    const value = (parsed as Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      times[key] = value;
    }
  }
  return times;
}

export function saveBestTimes(storage: StorageLike, times: BestTimes): void {
  const clean: BestTimes = {};
  for (const key of Object.keys(times)) {
    if (!isDifficultyKey(key)) continue;
    const value = times[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) clean[key] = value;
  }
  try {
    storage.setItem(BEST_TIMES_KEY, JSON.stringify(clean));
  } catch {
    // Storage may be unavailable (private mode, quota). Best times are a convenience, not critical.
  }
}

export interface RecordResult {
  times: BestTimes;
  /** True when this time is the first or beats the previous best. */
  improved: boolean;
  previous: number | undefined;
}

/** Pure: fold a completion time into the table, keeping the minimum per difficulty. */
export function recordTime(times: BestTimes, difficulty: DifficultyKey, ms: number): RecordResult {
  const previous = times[difficulty];
  if (!Number.isFinite(ms) || ms < 0) return { times, improved: false, previous };
  if (previous !== undefined && previous <= ms) return { times, improved: false, previous };
  return { times: { ...times, [difficulty]: ms }, improved: true, previous };
}

/** Load, record, and persist in one step. */
export function recordBestTime(
  storage: StorageLike,
  difficulty: DifficultyKey,
  ms: number,
): RecordResult {
  const result = recordTime(loadBestTimes(storage), difficulty, ms);
  if (result.improved) saveBestTimes(storage, result.times);
  return result;
}
