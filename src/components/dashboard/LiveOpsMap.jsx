import { Activity } from 'lucide-react'
import { hubs, routes, hubById, STATUS_STYLE } from '../../data/hubs'

/**
 * Stylized live operations map of the Jabodetabek + Bandung network.
 * Pure SVG: hubs pulse, shipment dots travel the routes continuously via SMIL
 * <animateMotion> (no React re-renders, smooth and cheap).
 */
function RouteLine({ a, b }) {
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      className="stroke-border-hi/50"
      strokeWidth="0.25"
      strokeDasharray="1.1 1.1"
    />
  )
}

function ShipmentDot({ a, b, dur, begin, reverse, color }) {
  const path = reverse
    ? `M ${b.x} ${b.y} L ${a.x} ${a.y}`
    : `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  return (
    <circle r="0.7" fill={color} style={{ filter: `drop-shadow(0 0 0.8px ${color})` }}>
      <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.12;0.88;1"
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}

function Hub({ hub, index }) {
  const style = STATUS_STYLE[hub.status]
  const r = hub.primary ? 1.7 : 1.25
  return (
    <g>
      {/* pulse ring */}
      <circle cx={hub.x} cy={hub.y} r={r} fill="none" className={style.ring} strokeWidth="0.3">
        <animate
          attributeName="r"
          values={`${r};${r + 3.2};${r}`}
          dur="3.4s"
          begin={`${index * 0.35}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.55;0;0.55"
          dur="3.4s"
          begin={`${index * 0.35}s`}
          repeatCount="indefinite"
        />
      </circle>
      {/* node */}
      <circle cx={hub.x} cy={hub.y} r={r + 0.7} className="fill-surface-2 stroke-border-hi" strokeWidth="0.3" />
      <circle cx={hub.x} cy={hub.y} r={r} className={style.dot} />
      {/* label */}
      <text
        x={hub.x}
        y={hub.y + r + 2.6}
        textAnchor="middle"
        className="fill-text-dim font-mono"
        style={{ fontSize: 2, letterSpacing: '0.02em' }}
      >
        {hub.name}
      </text>
    </g>
  )
}

export default function LiveOpsMap() {
  const totalInTransit = hubs.reduce((s, h) => s + h.inTransit, 0)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border-hi bg-surface-2 text-text-dim">
            <Activity className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text">Live Operations</h3>
            <p className="text-xs text-text-faint">Jabodetabek · Bandung corridor</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-[11px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
          LIVE
        </span>
      </div>

      {/* map canvas */}
      <div className="relative flex-1 bg-grid">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 60% at 45% 35%, rgba(59,130,246,0.06), transparent 70%)',
          }}
        />
        <svg
          viewBox="0 0 100 66"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
        >
          {/* routes */}
          {routes.map((r, i) => (
            <RouteLine key={i} a={hubById[r.from]} b={hubById[r.to]} />
          ))}
          {/* shipment dots: 1–2 per route, varied speed/direction */}
          {routes.map((r, i) => {
            const a = hubById[r.from]
            const b = hubById[r.to]
            const base = r.load === 'high' ? 5 : r.load === 'med' ? 6.5 : 8
            return (
              <g key={`dots-${i}`}>
                <ShipmentDot a={a} b={b} dur={base} begin={(i * 0.7) % base} color="#f59e0b" />
                {r.load !== 'low' && (
                  <ShipmentDot
                    a={a}
                    b={b}
                    dur={base + 1.5}
                    begin={(i * 1.3 + 2) % base}
                    reverse
                    color="#3b82f6"
                  />
                )}
              </g>
            )
          })}
          {/* hubs on top */}
          {hubs.map((h, i) => (
            <Hub key={h.id} hub={h} index={i} />
          ))}
        </svg>
      </div>

      {/* footer stats + legend */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <div className="flex items-center gap-4 font-mono text-[11px] text-text-dim">
          <span>
            <span className="text-text-faint">In transit </span>
            <span className="font-semibold text-text">{totalInTransit.toLocaleString('en-US')}</span>
          </span>
          <span>
            <span className="text-text-faint">Hubs </span>
            <span className="font-semibold text-text">{hubs.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-text-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Busy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Warning
          </span>
        </div>
      </div>
    </div>
  )
}
