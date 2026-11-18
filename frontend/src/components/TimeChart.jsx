import { useMemo, useState } from 'react';

const SERIES = [
  { key: 'median_speed', label: 'Median speed' },
  { key: 'heavy_congestion', label: 'Heavy congestion' },
  { key: 'bus_trips', label: 'Bus trips' },
];

const W = 700;
const H = 200;
const L = 44;
const B = 26;

function geometry(values) {
  const last = values.length - 1;
  if (last < 1) return null;
  const peak = Math.max(...values.map((value) => Number(value) || 0), 0);
  const maxv = Math.ceil((peak * 1.25) / 10) * 10 || 10;
  const cx = (index) => L + (index * (W - L - 10)) / last;
  const cy = (value) => H - B - (Number(value) / maxv) * (H - B - 12);
  const points = values.map((value, index) => [cx(index), cy(value)]);
  let line = `M${points[0][0]},${points[0][1]}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const next = points[index];
    const mid = (previous[0] + next[0]) / 2;
    line += `C${mid},${previous[1]} ${mid},${next[1]} ${next[0]},${next[1]}`;
  }
  return {
    cx,
    cy,
    line,
    area: `${line}L${cx(last)},${H - B}L${cx(0)},${H - B}Z`,
    last,
    grid: [0.25, 0.5, 0.75, 1].map((fraction) => ({
      y: cy(maxv * fraction),
      label: Math.round(maxv * fraction),
    })),
  };
}

function tipText(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return '—';
  return Number.isInteger(number) ? String(number) : String(number);
}

export default function TimeChart({ series }) {
  const [tab, setTab] = useState(SERIES[0].key);
  const [hover, setHover] = useState(null);
  const active = SERIES.find((item) => item.key === tab) || SERIES[0];
  const values = series?.[active.key] || [];
  const labels = series?.labels || [];
  const plot = useMemo(() => (values.length ? geometry(values) : null), [values]);

  function move(event) {
    if (!plot) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const index = Math.max(0, Math.min(plot.last, Math.round((x - L) / ((W - L - 10) / plot.last))));
    setHover({
      index,
      left: `${(plot.cx(index) / W) * 100}%`,
      top: `${(plot.cy(values[index]) / H) * 100}%`,
      value: values[index],
    });
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h3>Bus conditions by time of day</h3>
        <div className="tabs">
          {SERIES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === active.key ? 'on' : undefined}
              onClick={() => {
                setTab(item.key);
                setHover(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <small style={{ color: 'var(--mute)' }}>Historical sample windows: 09:00–09:30, 14:00–15:00 and 18:00–18:20</small>
      {plot ? (
        <div className="cw">
          <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={move} onMouseLeave={() => setHover(null)}>
            {plot.grid.map((line) => (
              <g key={line.label}>
                <line x1={L} x2={W - 10} y1={line.y} y2={line.y} stroke="var(--line)" />
                <text x="4" y={line.y + 4}>{line.label}</text>
              </g>
            ))}
            {labels.map((label, index) => (
              <text key={`${label}-${index}`} x={plot.cx(index)} y={H - 6} textAnchor="middle">{label}</text>
            ))}
            <path d={plot.area} fill="var(--accs)" opacity="0.7" />
            <path d={plot.line} fill="none" stroke="var(--acc)" strokeWidth="2" />
            <line
              x1={hover ? plot.cx(hover.index) : 0}
              x2={hover ? plot.cx(hover.index) : 0}
              y1="8"
              y2={H - B}
              stroke="var(--mute)"
              strokeDasharray="3 3"
              opacity={hover ? 1 : 0}
            />
            <circle
              cx={hover ? plot.cx(hover.index) : 0}
              cy={hover ? plot.cy(values[hover.index]) : 0}
              r="5"
              fill="var(--acc)"
              stroke="#fff"
              strokeWidth="2"
              opacity={hover ? 1 : 0}
            />
          </svg>
          {hover && (
            <div className="tip" style={{ left: hover.left, top: hover.top }}>{tipText(hover.value)}</div>
          )}
        </div>
      ) : (
        <p className="page-intro">The time series loads from the planner API.</p>
      )}
    </>
  );
}
