import Link from "next/link";
import type { Difficulty } from "@/lib/minesweeper";
import { formatDuration } from "@/lib/format";
import { MineIcon, TrophyIcon } from "@/components/ui/icons";

interface Props {
  difficulty: Difficulty;
  bestMs: number | undefined;
}

export function DifficultyCard({ difficulty, bestMs }: Props) {
  const { key, label, rows, cols, mines } = difficulty;
  return (
    <Link
      href={`/play?difficulty=${key}`}
      data-testid={`difficulty-${key}`}
      className="group flex w-[232px] h-[236px] flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-surface-2 active:translate-y-px focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
        <span className="font-mono text-xs text-ink-muted">
          {cols} x {rows}
        </span>
      </div>

      <div className="mt-4 flex h-[76px] items-center justify-center">
        <div
          className="field-preview max-h-[76px] max-w-[190px]"
          style={{
            aspectRatio: `${cols} / ${rows}`,
            height: rows >= cols ? "76px" : undefined,
            width: cols > rows ? "190px" : undefined,
            ["--cols" as string]: cols,
            ["--rows" as string]: rows,
          }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
        <MineIcon size={14} className="text-ink" />
        <span>
          <span className="font-mono text-ink">{mines}</span> mines
        </span>
      </div>

      <div className="mt-auto flex h-7 items-center gap-2 border-t border-line pt-3 text-sm">
        <TrophyIcon size={14} className={bestMs === undefined ? "text-ink-muted" : "text-accent"} />
        <span data-testid={`best-${key}`} className={bestMs === undefined ? "text-ink-muted" : "font-mono text-ink"}>
          {bestMs === undefined ? "No time yet" : formatDuration(bestMs)}
        </span>
        <span className="ml-auto text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
          Play
        </span>
      </div>
    </Link>
  );
}
