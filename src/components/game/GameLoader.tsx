"use client";

import { useSearchParams } from "next/navigation";
import { isDifficultyKey, parseSeed, type DifficultyKey } from "@/lib/minesweeper";
import { Game } from "./Game";

/** Reads difficulty and optional seed from the query string and mounts a fresh game for that pair. */
export function GameLoader() {
  const params = useSearchParams();
  const rawDifficulty = params.get("difficulty");
  const difficulty: DifficultyKey = isDifficultyKey(rawDifficulty) ? rawDifficulty : "beginner";
  const seed = parseSeed(params.get("seed"));
  return <Game key={`${difficulty}:${seed ?? "random"}`} difficulty={difficulty} seed={seed} />;
}
