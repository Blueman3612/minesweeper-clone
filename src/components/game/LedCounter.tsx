import { formatCounter } from "@/lib/format";

interface Props {
  value: number;
  label: string;
  testId: string;
}

/** Three-digit red LED readout with a fixed footprint. */
export function LedCounter({ value, label, testId }: Props) {
  return (
    <output
      aria-label={label}
      data-testid={testId}
      className="led flex h-10 w-[68px] items-center justify-center rounded-sm text-[26px]"
    >
      {formatCounter(value)}
    </output>
  );
}
