// Draws a football pitch with one dot per player.
// players: [{ pos: "GK", x: 50, y: 92 }, ...]
// x: 0 (left) to 100 (right). y: 0 (opponent goal, top) to 100 (own goal, bottom).

const WIDTH = 100;
const HEIGHT = 140; // pitch is taller than wide, so y percentages are scaled by 1.4

export default function Pitch({ players = [] }) {
  const line = {
    fill: "none",
    stroke: "rgba(255,255,255,0.8)",
    strokeWidth: 0.5,
  };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{
        width: "100%",
        maxWidth: 420,
        display: "block",
        margin: "0 auto",
        borderRadius: 8,
        background: "#2e7d32",
      }}
      role="img"
      aria-label="Football pitch showing the formation"
    >
      {/* Outer boundary */}
      <rect x="2" y="2" width="96" height="136" {...line} />

      {/* Halfway line and centre circle */}
      <line x1="2" y1="70" x2="98" y2="70" {...line} />
      <circle cx="50" cy="70" r="10" {...line} />
      <circle cx="50" cy="70" r="0.8" fill="rgba(255,255,255,0.8)" />

      {/* Top penalty area and goal area (opponent goal) */}
      <rect x="28" y="2" width="44" height="18" {...line} />
      <rect x="40" y="2" width="20" height="6" {...line} />

      {/* Bottom penalty area and goal area (own goal) */}
      <rect x="28" y="120" width="44" height="18" {...line} />
      <rect x="40" y="132" width="20" height="6" {...line} />

      {/* Players */}
      {players.map((p, i) => {
        const cx = p.x;
        const cy = (p.y / 100) * HEIGHT;
        return (
          <g key={`${p.pos}-${i}`}>
            <circle
              cx={cx}
              cy={cy}
              r="4.6"
              fill="#f5c518"
              stroke="#1b1b1b"
              strokeWidth="0.5"
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="3"
              fontWeight="bold"
              fill="#1b1b1b"
            >
              {p.pos}
            </text>
          </g>
        );
      })}
    </svg>
  );
}