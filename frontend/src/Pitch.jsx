// Draws a football pitch with one dot per player.
// players: [{ pos: "GK", x: 50, y: 92 }, ...]
// selectedPos: position code of the highlighted player (or "")
// onSelect: called with the position code when a dot is clicked
// x: 0 (left) to 100 (right). y: 0 (opponent goal, top) to 100 (own goal, bottom).
const WIDTH = 100;
const HEIGHT = 140; // pitch is taller than wide, so y percentages are scaled by 1.4
const STRIPES = 10; // mown grass bands

export default function Pitch({ players = [], selectedPos = "", onSelect }) {
  const line = {
    fill: "none",
    stroke: "rgba(255,255,255,0.85)",
    strokeWidth: 0.5,
  };

  return (
    <svg
      className="pitch"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Football pitch showing the formation"
    >
      {/* Grass stripes */}
      {Array.from({ length: STRIPES }, (_, i) => (
        <rect
          key={i}
          x="0"
          y={(HEIGHT / STRIPES) * i}
          width={WIDTH}
          height={HEIGHT / STRIPES}
          fill={i % 2 === 0 ? "#2f7d3a" : "#37893f"}
        />
      ))}

      {/* Outer boundary */}
      <rect x="2" y="2" width="96" height="136" {...line} />

      {/* Halfway line and centre circle */}
      <line x1="2" y1="70" x2="98" y2="70" {...line} />
      <circle cx="50" cy="70" r="10" {...line} />
      <circle cx="50" cy="70" r="0.8" fill="rgba(255,255,255,0.85)" />

      {/* Top penalty area, goal area, spot and arc (opponent goal) */}
      <rect x="28" y="2" width="44" height="18" {...line} />
      <rect x="40" y="2" width="20" height="6" {...line} />
      <circle cx="50" cy="14" r="0.7" fill="rgba(255,255,255,0.85)" />
      <path d="M 41.5 20 A 10 10 0 0 0 58.5 20" {...line} />

      {/* Bottom penalty area, goal area, spot and arc (own goal) */}
      <rect x="28" y="120" width="44" height="18" {...line} />
      <rect x="40" y="132" width="20" height="6" {...line} />
      <circle cx="50" cy="126" r="0.7" fill="rgba(255,255,255,0.85)" />
      <path d="M 41.5 120 A 10 10 0 0 1 58.5 120" {...line} />

      {/* Corner arcs */}
      <path d="M 2 4 A 2 2 0 0 0 4 2" {...line} />
      <path d="M 96 2 A 2 2 0 0 0 98 4" {...line} />
      <path d="M 2 136 A 2 2 0 0 1 4 138" {...line} />
      <path d="M 98 136 A 2 2 0 0 0 96 138" {...line} />

      {/* Players */}
      {players.map((p, i) => {
        const cx = p.x;
        const cy = (p.y / 100) * HEIGHT;
        const isSelected = p.pos === selectedPos;
        return (
          <g
            key={`${p.pos}-${i}`}
            className={`player${isSelected ? " player-selected" : ""}`}
            onClick={() => onSelect && onSelect(isSelected ? "" : p.pos)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect && onSelect(isSelected ? "" : p.pos);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${p.pos}${isSelected ? " (selected)" : ""}`}
          >
            {/* Larger invisible circle = easier to tap on phones */}
            <circle cx={cx} cy={cy} r="7" fill="transparent" />
            <circle
              className="player-dot"
              cx={cx}
              cy={cy}
              r={isSelected ? 5.6 : 4.8}
              fill={isSelected ? "#ffffff" : "#f5c518"}
              stroke={isSelected ? "#d32f2f" : "#14301a"}
              strokeWidth={isSelected ? 1.1 : 0.6}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={p.pos.length > 2 ? 2.8 : 3.4}
              fontWeight="700"
              fill="#14301a"
              style={{ pointerEvents: "none" }}
            >
              {p.pos}
            </text>
          </g>
        );
      })}
    </svg>
  );
}