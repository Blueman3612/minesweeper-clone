"use client";

import { memo, type PointerEvent, type MouseEvent } from "react";
import type { Cell as CellData, GameStatus } from "@/lib/minesweeper";
import { FlagIcon, MineIcon } from "@/components/ui/icons";

export type CellDisplay =
  | "hidden"
  | "flagged"
  | "question"
  | "revealed"
  | "mine"
  | "exploded"
  | "wrong-flag";

export function displayFor(cell: CellData, status: GameStatus, exploded: boolean): CellDisplay {
  if (cell.revealed) return cell.mine ? (exploded ? "exploded" : "mine") : "revealed";
  if (cell.mark === "flag") return status === "lost" && !cell.mine ? "wrong-flag" : "flagged";
  if (cell.mark === "question") return "question";
  return "hidden";
}

interface Props {
  cell: CellData;
  index: number;
  row: number;
  col: number;
  status: GameStatus;
  exploded: boolean;
  onReveal: (index: number) => void;
  onCycleMark: (index: number) => void;
  onPressChange: (pressing: boolean) => void;
}

function labelFor(display: CellDisplay, adjacent: number, row: number, col: number): string {
  const where = `row ${row + 1}, column ${col + 1}`;
  switch (display) {
    case "hidden":
      return `Hidden cell, ${where}`;
    case "flagged":
      return `Flagged cell, ${where}`;
    case "question":
      return `Question mark, ${where}`;
    case "revealed":
      return adjacent === 0 ? `Empty, ${where}` : `${adjacent} adjacent mines, ${where}`;
    case "mine":
      return `Mine, ${where}`;
    case "exploded":
      return `Exploded mine, ${where}`;
    case "wrong-flag":
      return `Wrong flag, ${where}`;
  }
}

function CellView({ cell, index, row, col, status, exploded, onReveal, onCycleMark, onPressChange }: Props) {
  const display = displayFor(cell, status, exploded);
  const over = status === "won" || status === "lost";
  const isHiddenLike = display === "hidden" || display === "flagged" || display === "question";

  const className = [
    "cell",
    isHiddenLike ? "cell-hidden" : "cell-revealed",
    isHiddenLike && over ? "cell-done" : "",
    display === "exploded" ? "cell-exploded" : "",
    display === "wrong-flag" ? "cell-wrong" : "",
    display === "question" ? "cell-question" : "",
    display === "revealed" && cell.adjacent > 0 ? `n${cell.adjacent}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleContextMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!over) onCycleMark(index);
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button === 0 && !over && isHiddenLike) onPressChange(true);
  };

  return (
    <button
      type="button"
      className={className}
      data-testid={`cell-${row}-${col}`}
      data-row={row}
      data-col={col}
      data-state={display}
      data-value={display === "revealed" ? cell.adjacent : undefined}
      aria-label={labelFor(display, cell.adjacent, row, col)}
      onClick={() => {
        if (!over) onReveal(index);
      }}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={() => onPressChange(false)}
      onPointerCancel={() => onPressChange(false)}
    >
      {display === "revealed" && cell.adjacent > 0 ? cell.adjacent : null}
      {display === "flagged" || display === "wrong-flag" ? <FlagIcon size="70%" /> : null}
      {display === "question" ? "?" : null}
      {display === "mine" || display === "exploded" ? (
        <MineIcon size="70%" className={display === "exploded" ? "text-[#1a0a08]" : "text-ink"} />
      ) : null}
    </button>
  );
}

export const Cell = memo(CellView);
