import type { Difficulty, DifficultyKey } from "./types";

export const DIFFICULTIES: Record<DifficultyKey, Difficulty> = {
  beginner: { key: "beginner", label: "Beginner", rows: 9, cols: 9, mines: 10 },
  intermediate: {
    key: "intermediate",
    label: "Intermediate",
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: { key: "expert", label: "Expert", rows: 16, cols: 30, mines: 99 },
};

export const DIFFICULTY_ORDER: readonly DifficultyKey[] = [
  "beginner",
  "intermediate",
  "expert",
];

export function isDifficultyKey(value: unknown): value is DifficultyKey {
  return (
    typeof value === "string" &&
    (DIFFICULTY_ORDER as readonly string[]).includes(value)
  );
}
