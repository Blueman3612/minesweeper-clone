import type { GameStatus } from "@/lib/minesweeper";

interface Props {
  status: GameStatus;
  pressing: boolean;
  onReset: () => void;
}

function faceFor(status: GameStatus, pressing: boolean): { glyph: string; name: string } {
  if (status === "won") return { glyph: "😎", name: "won" };
  if (status === "lost") return { glyph: "😵", name: "lost" };
  if (pressing) return { glyph: "😮", name: "pressing" };
  return { glyph: "🙂", name: "idle" };
}

export function FaceButton({ status, pressing, onReset }: Props) {
  const face = faceFor(status, pressing);
  return (
    <button
      type="button"
      onClick={onReset}
      aria-label="New game"
      data-testid="face"
      data-face={face.name}
      className="bevel-up flex h-11 w-11 items-center justify-center text-[24px] leading-none transition-[filter] hover:brightness-110 active:brightness-90 active:shadow-[inset_2px_2px_0_#0b0e14]"
    >
      <span aria-hidden="true" className="select-none">
        {face.glyph}
      </span>
    </button>
  );
}
