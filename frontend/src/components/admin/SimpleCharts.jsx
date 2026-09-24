const COLORS = ["#4a2c17", "#b8860b", "#c0392b", "#2f6378", "#2d6a4f", "#6b5e52"];

function formatShortRp(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `Rp${Math.round(v / 1_000)}rb`;
  return `Rp${v}`;
}

export function BarChart({ data = [], height = 200 }) {
  const items = (data || []).filter((d) => d && d.label != null);
  if (!items.length) return <p className="text-secondary small mb-0">Belum ada data.</p>;

  const max = Math.max(...items.map((d) => Number(d.value) || 0), 1);
  const barW = Math.max(28, Math.min(48, Math.floor(320 / items.length)));
  const gap = 12;
  const padTop = 24;
  const padBottom = 36;
  const innerH = height - padTop - padBottom;
  const width = Math.max(items.length * (barW + gap) + gap, 280);

  return (
    <div className="admin-chart-scroll">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {items.map((d, i) => {
          const val = Number(d.value) || 0;
          const h = Math.round((val / max) * innerH);
          const x = gap + i * (barW + gap);
          const y = padTop + (innerH - h);
          return (
            <g key={`${d.label}-${i}`}>
              <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={3} fill={COLORS[i % COLORS.length]} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#5a4a3a">
                {formatShortRp(val)}
              </text>
              <text x={x + barW / 2} y={height - 12} textAnchor="middle" fontSize="11" fill="#6b5e52">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DonutChart({ data = [], size = 160 }) {
  const items = (data || [])
    .map((d) => ({ label: d.label, value: Number(d.value) || 0 }))
    .filter((d) => d.value > 0);
  if (!items.length) return <p className="text-secondary small mb-0">Belum ada data.</p>;

  const total = items.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  const stroke = 28;
  const radius = r - stroke / 2;
  const c = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="admin-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={radius} fill="none" stroke="#efe6d4" strokeWidth={stroke} />
        {items.map((d, i) => {
          const len = (d.value / total) * c;
          const el = (
            <circle
              key={d.label}
              cx={r}
              cy={r}
              r={radius}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${r} ${r})`}
            />
          );
          offset += len;
          return el;
        })}
        <text x={r} y={r - 4} textAnchor="middle" fontSize="18" fontWeight="600" fill="#2b2320">
          {total}
        </text>
        <text x={r} y={r + 14} textAnchor="middle" fontSize="10" fill="#8a8078">
          total
        </text>
      </svg>
      <ul className="admin-donut-legend">
        {items.map((d, i) => (
          <li key={d.label}>
            <span className="admin-donut-swatch" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="admin-donut-label">{d.label}</span>
            <strong>{d.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBarChart({ data = [] }) {
  const items = (data || []).slice(0, 8);
  if (!items.length) return <p className="text-secondary small mb-0">Belum ada data.</p>;
  const max = Math.max(...items.map((d) => Number(d.value) || 0), 1);

  return (
    <div className="admin-hbar-list">
      {items.map((d, i) => {
        const val = Number(d.value) || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={`${d.label}-${i}`} className="admin-hbar-row">
            <div className="admin-hbar-meta">
              <span className="admin-hbar-name">{d.label}</span>
              <span className="admin-hbar-val">{formatShortRp(val)}</span>
            </div>
            <div className="admin-hbar-track">
              <div className="admin-hbar-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}