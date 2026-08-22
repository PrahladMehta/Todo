const Chevrons = ({ x, y, scale = 1, opacity = 0.17, rows = 4 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    {Array.from({ length: rows }, (_, index) => index * 13).map((offset) => (
      <path
        key={offset}
        d="M0 0l13 11L26 0l13 11L52 0l13 11L78 0"
        transform={`translate(0 ${offset})`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ))}
  </g>
);

export const ChevronPattern = ({ className = '' }) => (
  <svg
    viewBox="0 0 390 560"
    preserveAspectRatio="xMidYMid slice"
    className={`pointer-events-none absolute inset-0 size-full ${className}`}
    aria-hidden="true"
  >
    <circle cx="372" cy="10" r="88" fill="#ffffff" opacity="0.1" />
    <circle cx="372" cy="10" r="54" fill="#ffffff" opacity="0.09" />
    <Chevrons x={26} y={92} />
    <Chevrons x={252} y={378} opacity={0.15} />
    <Chevrons x={206} y={470} scale={0.7} opacity={0.13} rows={3} />
  </svg>
);
