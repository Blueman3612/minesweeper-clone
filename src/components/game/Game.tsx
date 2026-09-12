"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  DIFFICULTIES,
  createGame,
  gameReducer,
  randomSeed,
  remainingMines,
  safeCellsRemaining,
  type DifficultyKey,
  type GameAction,
  type GameState,
} from "@/lib/minesweeper";
import { recordBestTime, type RecordResult } from "@/lib/bestTimes";
import { formatDuration } from "@/lib/format";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { Board } from "./Board";
import { Clock } from "./Clock";
import { FaceButton } from "./FaceButton";
import { LedCounter } from "./LedCounter";

const CELL_SIZE: Record<DifficultyKey, number> = {
  beginner: 40,
  intermediate: 32,
  expert: 28,
};

interface Props {
  difficulty: DifficultyKey;
  /** Fixed seed from the URL, or null to draw a fresh one for every round. */
  seed: number | null;
}

function statusText(state: GameState, record: RecordResult | null): string {
  switch (state.status) {
    case "ready":
      return "Click any cell to start. The first click is always safe.";
    case "playing": {
      const left = safeCellsRemaining(state.board);
      return `${left} safe ${left === 1 ? "cell" : "cells"} left`;
    }
    case "lost":
      return "Boom. Click the face to try again.";
    case "won": {
      const ms = (state.endedAt ?? 0) - (state.startedAt ?? 0);
      const time = `Cleared in ${formatDuration(ms)}.`;
      if (!record) return time;
      if (record.improved) return `${time} ${record.previous === undefined ? "First time saved." : "New best!"}`;
      return `${time} Best ${formatDuration(record.previous ?? 0)}.`;
    }
  }
}

export function Game({ difficulty, seed }: Props) {
  const spec = DIFFICULTIES[difficulty];
  const [state, setState] = useState<GameState>(() => createGame(difficulty, seed ?? randomSeed()));
  const [pressing, setPressing] = useState(false);
  const [record, setRecord] = useState<RecordResult | null>(null);

  const apply = useCallback(
    (action: GameAction) => {
      setPressing(false);
      const next = gameReducer(state, action);
      if (next === state) return;
      setState(next);
      if (next.status === "won" && state.status !== "won" && next.startedAt != null && next.endedAt != null) {
        setRecord(recordBestTime(window.localStorage, difficulty, next.endedAt - next.startedAt));
      }
    },
    [state, difficulty],
  );

  const handleReveal = useCallback((index: number) => apply({ type: "reveal", index, at: Date.now() }), [apply]);
  const handleCycleMark = useCallback((index: number) => apply({ type: "cycleMark", index }), [apply]);
  const handleReset = useCallback(() => {
    setPressing(false);
    setRecord(null);
    setState(createGame(difficulty, seed ?? randomSeed()));
  }, [difficulty, seed]);

  return (
    <main
      className="flex flex-1 flex-col items-center gap-5 px-4 py-8"
      data-testid="game"
      data-status={state.status}
      data-difficulty={difficulty}
    >
      <div className="flex max-w-full flex-col items-stretch gap-4 overflow-x-auto">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-9 items-center gap-1 rounded-md px-3 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink active:bg-surface-2"
          >
            <ChevronLeftIcon size={16} />
            Menu
          </Link>
          <span className="flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 font-mono text-xs text-ink-muted">
            <span className="font-sans text-sm font-semibold text-ink">{spec.label}</span>
            {spec.cols} x {spec.rows}, {spec.mines} mines
          </span>
        </nav>

        <div className="frame flex flex-col gap-2 p-2">
          <div className="bevel-down flex items-center justify-between px-2 py-1.5">
            <LedCounter value={remainingMines(state)} label="Mines remaining" testId="mine-counter" />
            <FaceButton status={state.status} pressing={pressing} onReset={handleReset} />
            <Clock startedAt={state.startedAt} endedAt={state.endedAt} />
          </div>
          <div className="bevel-down p-[3px]">
            <Board
              board={state.board}
              status={state.status}
              explodedIndex={state.explodedIndex}
              cellSize={CELL_SIZE[difficulty]}
              onReveal={handleReveal}
              onCycleMark={handleCycleMark}
              onPressChange={setPressing}
            />
          </div>
        </div>
      </div>

      <p
        data-testid="status"
        role="status"
        className={`flex h-6 items-center text-sm ${state.status === "won" ? "text-accent" : state.status === "lost" ? "text-danger" : "text-ink-muted"}`}
      >
        {statusText(state, record)}
      </p>
    </main>
  );
}
