import type { DimensionScores } from "@tpmforge/core";

const DIMENSION_LABELS: { key: keyof DimensionScores; label: string }[] = [
  { key: "knowledge", label: "Knowledge" },
  { key: "understanding", label: "Understanding" },
  { key: "application", label: "Application" },
  { key: "communication", label: "Communication" },
  { key: "decision_making", label: "Decision" },
  { key: "execution", label: "Execution" },
];

const CENTER = 120;
const RADIUS = 92;

function point(angle: number, radius: number) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function polygonPoints(radius: number, scale: number, data: DimensionScores) {
  return DIMENSION_LABELS.map((d, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return point(angle, (radius * scale * (data[d.key] / 100)));
  });
}

export function RadarChart({ data }: { data: DimensionScores }) {
  const rings = [25, 50, 75, 100].map((v) => {
    const pts = DIMENSION_LABELS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      return point(angle, (RADIUS * v) / 100);
    });
    return pts;
  });

  const valuePoints = polygonPoints(RADIUS, 1, data);

  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" role="img" aria-label="Readiness radar">
      <g>
        {rings.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="rgba(113, 113, 122, 0.35)"
            strokeWidth="1"
          />
        ))}
        {DIMENSION_LABELS.map((_, i) => {
          const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
          const outer = point(angle, RADIUS);
          const label = point(angle, RADIUS + 22);
          return (
            <g key={i}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(113, 113, 122, 0.35)"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y}
                fill="#a1a1aa"
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {DIMENSION_LABELS[i].label}
              </text>
            </g>
          );
        })}
        <polygon
          points={valuePoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="#818cf8"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {valuePoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#a5b4fc"
          />
        ))}
      </g>
    </svg>
  );
}
