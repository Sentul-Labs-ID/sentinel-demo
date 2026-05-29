import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Network, Play, Loader2, Boxes, AlertTriangle, Wallet, GitBranch, Timer, Wrench, Check } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import CountUp from '../components/ui/CountUp'
import { Field, Select } from '../components/ui/inputs'
import NetworkGraph from '../components/viz/NetworkGraph'
import {
  networkNodes, networkEdges, SCENARIOS, scenarioById, HORIZONS, computeCascade, formatHM,
} from '../data/hubs'
import { cn } from '../lib/utils'

const HEALTH_HEX = { healthy: '#10b981', busy: '#f59e0b', warning: '#f97316', orange: '#f97316', red: '#ef4444' }

export default function CascadeSimulator() {
  const [form, setForm] = useState({ scenario: 'cikarang', severity: 70, horizon: '12h', peak: false })
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [result, setResult] = useState(null)
  const [applied, setApplied] = useState(new Set())

  const fgRef = useRef(null)
  const runRef = useRef({ active: false, failTimes: {}, failHub: null, start: 0 })

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  // stable copies so the force engine doesn't mutate the source data
  const graphData = useMemo(
    () => ({ nodes: networkNodes.map((n) => ({ ...n })), links: networkEdges.map((e) => ({ ...e })) }),
    [],
  )

  function run() {
    const res = computeCascade(form)
    runRef.current = { active: true, failTimes: res.failTimes, failHub: res.failHub, start: performance.now() }
    setApplied(new Set())
    setResult(null)
    setPhase('running')
    setTimeout(() => {
      setResult(res)
      setPhase('done')
    }, res.totalMs + 250)
  }

  function nodeState(node) {
    const run = runRef.current
    if (!run.active) return node.health
    const ft = run.failTimes[node.id]
    if (ft === undefined) return node.health
    const el = performance.now() - run.start
    if (el >= ft) return 'red'
    if (el >= ft - 450) return 'orange'
    return node.health
  }

  function paintNode(node, ctx, globalScale) {
    const run = runRef.current
    const state = nodeState(node)
    const hex = HEALTH_HEX[state] ?? '#10b981'
    const r = 3 + node.capacity / 12

    // pulse ring on the failing source hub
    if (run.active && node.id === run.failHub) {
      const pulse = (Math.sin(performance.now() / 180) + 1) / 2
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 2 + pulse * 6, 0, 2 * Math.PI)
      ctx.strokeStyle = `rgba(239,68,68,${0.55 * (1 - pulse)})`
      ctx.lineWidth = 1.2
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
    ctx.fillStyle = hex
    ctx.globalAlpha = 0.92
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.lineWidth = 0.6
    ctx.strokeStyle = 'rgba(10,14,20,0.9)'
    ctx.stroke()

    if (node.tier <= 2 || globalScale > 3) {
      const fontSize = Math.max(2.4, 10 / globalScale)
      ctx.font = `${node.tier === 1 ? 'bold ' : ''}${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = node.tier === 1 ? '#e6edf3' : '#94a3b8'
      ctx.fillText(node.name, node.x, node.y + r + 1)
    }
  }

  // metrics adjusted by applied mitigations
  const reduction = result
    ? Math.min(75, result.mitigations.filter((m) => applied.has(m.id)).reduce((s, m) => s + m.reduction, 0))
    : 0
  const factor = 1 - reduction / 100
  const m = result?.metrics
  const metricTiles = m
    ? [
        { icon: Boxes, label: 'Affected Shipments', value: Math.round(m.affected * factor), color: '#e6edf3' },
        { icon: AlertTriangle, label: 'SLA Breaches', value: Math.round(m.breaches * factor), color: '#f97316' },
        { icon: Wallet, label: 'Revenue Impact', value: Math.round(m.revenue * factor), prefix: 'Rp ', suffix: 'M', color: '#ef4444' },
        { icon: GitBranch, label: 'Cascade Depth', value: m.depth, suffix: ' hubs', color: '#94a3b8' },
      ]
    : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          Cascade Simulator
        </h1>
        <p className="mt-1.5 text-sm text-text-dim">
          Model how a single hub disruption ripples across the delivery network.
        </p>
      </div>

      {/* controls */}
      <Card icon={Network} title="Scenario" className="mb-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Disruption scenario" className="lg:col-span-2">
            <Select
              value={form.scenario}
              onChange={set('scenario')}
              options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))}
              disabled={phase === 'running'}
            />
          </Field>
          <Field label="Time horizon">
            <Select value={form.horizon} onChange={set('horizon')} options={HORIZONS.map((h) => ({ value: h.id, label: h.label }))} disabled={phase === 'running'} />
          </Field>
          <Field label="Peak event">
            <button
              type="button"
              disabled={phase === 'running'}
              onClick={() => set('peak')(!form.peak)}
              className="flex h-[38px] items-center gap-2 rounded-md border border-border-hi bg-surface-2 px-3 text-sm text-text-dim transition-colors hover:border-accent/50"
            >
              <span className={cn('flex h-5 w-9 items-center rounded-full p-0.5 transition-colors', form.peak ? 'bg-accent' : 'bg-surface border border-border-hi')}>
                <span className={cn('block h-4 w-4 rounded-full bg-text transition-transform', form.peak ? 'translate-x-4 bg-bg' : '')} />
              </span>
              {form.peak ? 'On' : 'Off'}
            </button>
          </Field>
        </div>

        <div className="mt-4 grid items-end gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-text-dim">Severity</span>
              <span className="font-mono tabular-nums text-text">{form.severity}%</span>
            </div>
            <input
              type="range" min={5} max={100} value={form.severity}
              onChange={(e) => set('severity')(Number(e.target.value))}
              disabled={phase === 'running'}
              className="slider-accent h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
              style={{ background: `linear-gradient(to right, #f59e0b ${form.severity}%, #1f2937 ${form.severity}%)` }}
            />
          </div>
          <Button onClick={run} disabled={phase === 'running'} size="lg" icon={phase === 'running' ? undefined : Play}>
            {phase === 'running' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Simulating…
              </>
            ) : (
              'Run Simulation'
            )}
          </Button>
        </div>
      </Card>

      {/* graph + results */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* network */}
        <Card
          title="Dependency Network"
          subtitle={`${networkNodes.length} hubs · node size = capacity`}
          className="lg:col-span-2"
          bodyClassName="p-2"
          action={
            <div className="flex items-center gap-3 font-mono text-[10px] text-text-faint">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Stressed</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Failed</span>
            </div>
          }
        >
          <div className="rounded-md bg-bg/40 bg-grid">
            <NetworkGraph
              data={graphData}
              fgRef={fgRef}
              height={460}
              nodeCanvasObject={paintNode}
              linkColor={() => 'rgba(148,163,184,0.16)'}
              linkWidth={0.6}
            />
          </div>
        </Card>

        {/* side panel */}
        <div className="lg:col-span-1">
          {phase !== 'done' ? (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-md border border-border bg-surface p-6 text-center">
              <div>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-border-hi bg-surface-2 text-text-faint">
                  {phase === 'running' ? <Loader2 className="h-6 w-6 animate-spin text-accent" /> : <Network className="h-6 w-6" strokeWidth={1.75} />}
                </span>
                <p className="mt-4 font-mono text-sm text-text-dim">
                  {phase === 'running' ? 'Propagating failure…' : 'No simulation yet'}
                </p>
                <p className="mt-1.5 text-xs text-text-faint">
                  {phase === 'running' ? 'Watch the cascade spread across the network.' : 'Pick a scenario and run the simulation.'}
                </p>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
              <Card title="Impact" subtitle={scenarioById[form.scenario].label} bodyClassName="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {metricTiles.map((t) => {
                    const Icon = t.icon
                    return (
                      <div key={t.label} className="rounded-md border border-border bg-surface-2/50 p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
                          <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">{t.label}</span>
                        </div>
                        <p className="mt-1 font-mono text-xl font-semibold tabular-nums" style={{ color: t.color }}>
                          <CountUp value={t.value} prefix={t.prefix ?? ''} suffix={t.suffix ?? ''} duration={0.8} />
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-3 py-2">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-text-faint">
                    <Timer className="h-3.5 w-3.5" strokeWidth={2} /> Time to first cascade
                  </span>
                  <span className="font-mono text-sm font-semibold text-text">{formatHM(m.ttfcMin)}</span>
                </div>
                {reduction > 0 && (
                  <p className="text-center font-mono text-[11px] text-success">
                    ↓ {reduction}% impact reduction from applied mitigations
                  </p>
                )}
              </Card>

              <Card title="Recommended Mitigations" icon={Wrench} bodyClassName="space-y-2">
                {result.mitigations.map((mit) => {
                  const on = applied.has(mit.id)
                  return (
                    <button
                      key={mit.id}
                      onClick={() =>
                        setApplied((prev) => {
                          const next = new Set(prev)
                          next.has(mit.id) ? next.delete(mit.id) : next.add(mit.id)
                          return next
                        })
                      }
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors',
                        on ? 'border-success/40 bg-success/5' : 'border-border hover:border-border-hi',
                      )}
                    >
                      <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-success bg-success text-bg' : 'border-border-hi')}>
                        {on && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className={cn('flex-1 text-[13px]', on ? 'text-text' : 'text-text-dim')}>{mit.label}</span>
                      <span className="font-mono text-[11px] text-success">−{mit.reduction}%</span>
                    </button>
                  )
                })}
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
