import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

export function MineIcon({ size = "1em", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...rest}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
        <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" />
      </g>
      <circle cx="12" cy="12" r="7" fill="currentColor" />
      <circle cx="9.5" cy="9.5" r="1.8" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

export function FlagIcon({ size = "1em", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M6 21h12v-2H6z" fill="currentColor" />
      <path d="M11 19V4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 4l8 4-8 4z" fill="#e5484d" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = "1em", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" {...rest}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrophyIcon({ size = "1em", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" {...rest}>
      <path
        d="M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3M12 13v4M8 20h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
