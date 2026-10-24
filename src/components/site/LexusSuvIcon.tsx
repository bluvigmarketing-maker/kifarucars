// Side profile of a Lexus-style luxury SUV (roof rails, sloped D-pillar,
// spindle-grille nose), drawn as a stroke icon to sit with lucide icons.
export function LexusSuvIcon({ className, size = 26 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 16"
      width={size}
      height={size / 2}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* roof rails */}
      <path d="M7 2.4h11.5" />
      {/* body with wheel arches */}
      <path d="M3 12h3.2a2.4 2.4 0 0 1 4.8 0h9.6a2.4 2.4 0 0 1 4.8 0H30V9.7c0-.8-.5-1.3-1.4-1.5L24 7.3l-3.6-3.2a1.8 1.8 0 0 0-1.2-.5H6.3c-.6 0-1.1.3-1.4.8L2.6 8.1A3.6 3.6 0 0 0 2 10v1c0 .6.4 1 1 1Z" />
      {/* side windows */}
      <path d="M6.7 5h5.8v2.4H5.1Z" />
      <path d="M14 5h5.2l2.4 2.4H14Z" />
      {/* headlight + spindle grille */}
      <path d="M26.4 8.6l2.3.5" />
      <path d="M29.1 9.6l.9.4-.4 1.2-.9-.4Z" />
      {/* wheels */}
      <circle cx="8.6" cy="12" r="1.7" />
      <circle cx="23" cy="12" r="1.7" />
    </svg>
  );
}
