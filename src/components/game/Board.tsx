"use client";

import { memo } from "react";
import type { Board as BoardData, GameStatus } from "@/lib/minesweeper";
import { Cell } from "./Cell";

interface Props {
  board: BoardData;
  status: GameStatus;
  explodedIndex: number | null;
  cellSize: number;
  onReveal: (index: number) => void;
  onCycleMark: (index: number) => void;
  onPressChange: (pressing: boolean) => void;
}

function BoardView({ board, status, explodedIndex, cellSize, onReveal, onCycleMark, onPressChange }: Props) {
  return (
    <div
      role="grid"
      aria-label="Minefield"
      data-testid="board"
      className="grid"
      style={{
        ["--cell" as string]: `${cellSize}px`,
        gridTemplateColumns: `repeat(${board.cols}, var(--cell))`,
      }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerLeave={() => onPressChange(false)}
    >
      {board.cells.map((cell, index) => {
        const row = Math.floor(index / board.cols);
        const col = index % board.cols;
        return (
          <Cell
            key={index}
            cell={cell}
            index={index}
            row={row}
            col={col}
            status={status}
            exploded={explodedIndex === index}
            onReveal={onReveal}
            onCycleMark={onCycleMark}
            onPressChange={onPressChange}
          />
        );
      })}
    </div>
  );
}

export const Board = memo(BoardView);
