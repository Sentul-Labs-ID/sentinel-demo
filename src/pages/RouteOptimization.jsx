import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { AnimatePresence, motion } from 'framer-motion'
import { Route as RouteIcon, Zap, Leaf, Wallet, Check, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import CountUp from '../components/ui/CountUp'
import { Field, Select, RadioPills } from '../components/ui/inputs'
import { computeRoutes } from '../data/routes'
import { hubs, hubById } from '../data/hubs'
import { locationOptions, vehicleOptions } from '../data/logistics'
import { formatRupiah, cn } from '../lib/utils'

/* quadratic bezier path + its midpoint, in the 0–100 × 0–66 map space */
function bezier(o, d, curve) {
  const mx = (o.x + d.x) / 2
  const my = (o.y + d.y) / 2
  const vx = d.x - o.x
  const vy = d.y - o.y
  const len = Math.hypot(vx, vy) || 1
  const cx = mx + (-vy / len) * curve
  const cy = my + (vx / len) * curve
  return {
    path: `M ${o.x} ${o.y} Q ${cx} ${cy} ${d.x} ${d.y}`,
    mid: { x: 0.25 * o.x + 0.5 * cx + 0.25 * d.x, y: 0.25 * o.y + 0.5 * cy + 0.25 * d.y },
  }
}

const PRIORITIES = [
  { key: 'speed', label: 'Speed', icon: Zap },
  { key: 'cost', label: 'Cost', icon: Wallet },
  { key: 'carbon', label: 'Carbon', icon: Leaf },
]
const METRIC_ICON = { fastest: Zap, greenest: Leaf, cheapest: Wallet }

function RouteMap({ origin, destination, routes, phase }) {
  const o = hubById[origin]
  const d = hubById[destination]

  // ghost candidate lines while "exploring"
  const ghosts = useMemo(() => {
    const arr = []
    for (let i = 0; i < 16; i++) {
      const a = hubs[Math.floor(Math.random() * hubs.length)]
      const b = hubs[Math.floor(Math.random() * hubs.length)]
      arr.push({ path: bezier(a, b, (Math.random() - 0.5) * 50).path, delay: Math.random() * 0.6 })
    }
    return arr
    // regenerate each time we enter exploring
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'exploring'])

  return (
    <div className="relative h-full overflow-hidden rounded-md border border-border bg-surface bg-grid">
      <svg viewBox="0 0 100 66" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        {/* faint hub field */}
        {hubs.map((h) => (
          <g key={h.id}>
            <circle cx={h.x} cy={h.y} r="0.9" className="fill-text-faint/40" />
            <text x={h.x} y={h.y - 1.8} textAnchor="middle" className="fill-text-faint font-mono" style={{ fontSize: 1.8 }}>
              {h.name}
            </text>
          </g>
        ))}

        {/* exploring ghosts */}
        <AnimatePresence>
          {phase === 'exploring' &&
            ghosts.map((g, i) => (
              <motion.path
                key={i}
                d={g.path}
                fill="none"
                stroke="#334155"
                strokeWidth="0.4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.7, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, delay: g.delay, repeat: Infinity, repeatDelay: 0.2 }}
              />
            ))}
        </AnimatePresence>

        {/* final routes */}
        {phase === 'done' &&
          routes.map((r, i) => {
            const b = bezier(o, d, r.curve)
            return (
              <g key={r.id}>
                <motion.path
                  d={b.path}
                  fill="none"
                  stroke={r.color}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, delay: i * 0.18, ease: 'easeOut' }}
                />
                <motion.circle
                  cx={b.mid.x}
                  cy={b.mid.y}
                  r="1"
                  fill={r.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.18 }}
                />
              </g>
            )
          })}

        {/* endpoints */}
        {phase === 'done' && (
          <>
            <circle cx={o.x} cy={o.y} r="2" className="fill-text stroke-bg" strokeWidth="0.5" />
            <circle cx={d.x} cy={d.y} r="2" fill="none" className="stroke-accent" strokeWidth="0.8" />
            <circle cx={d.x} cy={d.y} r="0.9" className="fill-accent" />
          </>
        )}
      </svg>

      {/* exploring overlay */}
      <AnimatePresence>
        {phase === 'exploring' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-bg/90 to-transparent px-4 py-3"
          >
            <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={2.5} />
            <span className="font-mono text-sm text-text">
              Exploring <CountUp value={247} duration={1.6} /> routes…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* legend */}
      {phase === 'done' && (
        <div className="absolute right-3 top-3 space-y-1 rounded-md border border-border bg-surface-2/80 px-2.5 py-2 backdrop-blur">
          {routes.map((r) => (
            <div key={r.id} className="flex items-center gap-2 font-mono text-[10px] text-text-dim">
              <span className="h-0.5 w-4 rounded-full" style={{ background: r.color }} />
              {r.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RouteOptimization() {
  const [form, setForm] = useState({
    origin: 'jakarta',
    destination: 'bandung',
    vehicle: 'van',
    priorities: { speed: 60, cost: 45, carbon: 75 },
  })
  const [phase, setPhase] = useState('idle') // idle | exploring | done
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(null)

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const setPriority = (k) => (v) => setForm((f) => ({ ...f, priorities: { ...f.priorities, [k]: v } }))

  function optimize() {
    setResult(computeRoutes(form))
    setSelected(null)
    setPhase('exploring')
    setTimeout(() => setPhase('done'), 2000)
  }

  const recommended = result?.routes.find((r) => r.recommended)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          Route Optimization
        </h1>
        <p className="mt-1.5 text-sm text-text-dim">
          Balance speed, cost, and carbon across a Pareto frontier of candidate routes.
        </p>
      </div>

      {/* controls */}
      <Card icon={RouteIcon} title="Optimization Inputs" className="mb-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Origin">
            <Select value={form.origin} onChange={set('origin')} options={locationOptions} disabled={phase === 'exploring'} />
          </Field>
          <Field label="Destination">
            <Select value={form.destination} onChange={set('destination')} options={locationOptions} disabled={phase === 'exploring'} />
          </Field>
          <Field label="Vehicle" className="lg:col-span-2">
            <RadioPills value={form.vehicle} onChange={set('vehicle')} options={vehicleOptions} disabled={phase === 'exploring'} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PRIORITIES.map((p) => {
            const Icon = p.icon
            const val = form.priorities[p.key]
            return (
              <div key={p.key}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-text-dim">
                    <Icon className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
                    {p.label} priority
                  </span>
                  <span className="font-mono tabular-nums text-text">{val}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={(e) => setPriority(p.key)(Number(e.target.value))}
                  className="slider-accent h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
                  style={{ background: `linear-gradient(to right, #f59e0b ${val}%, #1f2937 ${val}%)` }}
                />
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <Button onClick={optimize} disabled={phase === 'exploring'} size="lg" icon={phase === 'exploring' ? undefined : RouteIcon}>
            {phase === 'exploring' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Optimizing…
              </>
            ) : (
              'Optimize Routes'
            )}
          </Button>
        </div>
      </Card>

      {/* results */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="h-[340px] lg:h-[460px]">
            {phase === 'idle' ? (
              <div className="flex h-full items-center justify-center rounded-md border border-border bg-surface bg-grid text-center">
                <div>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-border-hi bg-surface-2 text-text-faint">
                    <RouteIcon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <p className="mt-4 font-mono text-sm text-text-dim">No routes yet</p>
                  <p className="mt-1.5 text-xs text-text-faint">Set priorities and optimize to explore the route space.</p>
                </div>
              </div>
            ) : (
              <RouteMap origin={form.origin} destination={form.destination} routes={result?.routes ?? []} phase={phase} />
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          {phase === 'done' && result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
              {/* pareto */}
              <Card title="Pareto Frontier" subtitle="Cost vs. carbon · bubble = time">
                <ResponsiveContainer width="100%" height={196}>
                  <ScatterChart margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid stroke="#1f2937" />
                    <XAxis
                      type="number" dataKey="cost" name="Cost"
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`} axisLine={{ stroke: '#1f2937' }} tickLine={false}
                    />
                    <YAxis
                      type="number" dataKey="carbon" name="Carbon" unit="kg"
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={40}
                    />
                    <ZAxis type="number" dataKey="time" range={[50, 260]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: '#334155' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const p = payload[0].payload
                        return (
                          <div className="rounded-md border border-border-hi bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] shadow-xl">
                            <p className="text-text">{p.name}</p>
                            <p className="text-text-faint">{formatRupiah(p.cost)} · {p.carbon}kg · {p.time}min</p>
                          </div>
                        )
                      }}
                    />
                    <Scatter data={result.pareto.filter((p) => !p.highlight)} fill="#475569" />
                    <Scatter data={result.pareto.filter((p) => p.highlight)} animationDuration={700}>
                      {result.pareto.filter((p) => p.highlight).map((p, i) => (
                        <Cell key={i} fill={p.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>

              {/* comparison cards */}
              <div className="space-y-2.5">
                {result.routes.map((r) => {
                  const Icon = METRIC_ICON[r.id]
                  const isSel = selected === r.id
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        'rounded-md border bg-surface p-3 transition-colors',
                        isSel ? 'border-accent' : 'border-border',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold text-text">
                          <Icon className="h-4 w-4" style={{ color: r.color }} strokeWidth={2.25} />
                          {r.name}
                          {r.recommended && <Badge variant="accent" dot>Recommended</Badge>}
                        </span>
                        <Button size="sm" variant={isSel ? 'primary' : 'secondary'} onClick={() => setSelected(r.id)} icon={isSel ? Check : undefined}>
                          {isSel ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                      <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                        {[
                          { k: 'Time', v: `${r.time}m` },
                          { k: 'Cost', v: formatRupiah(r.cost, { compact: true }) },
                          { k: 'CO₂e', v: `${r.carbon}kg` },
                        ].map((m) => (
                          <div key={m.k} className="rounded border border-border bg-surface-2/50 py-1.5">
                            <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">{m.k}</p>
                            <p className="font-mono text-sm font-semibold tabular-nums text-text">{m.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
