import { useRef, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip } from 'recharts'
import { AnimatePresence, motion } from 'framer-motion'
import { ScanSearch, ChevronDown, Network, BarChart3, ShieldAlert } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ResultArea from '../components/demo/ResultArea'
import NetworkGraph from '../components/viz/NetworkGraph'
import {
  fraudDistribution,
  flaggedShipments,
  syndicateGraph,
  fraudSummary,
  FRAUD_TYPE,
  TOTAL_SCANNED,
} from '../data/fraud'
import { cn } from '../lib/utils'

function HistTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border-hi bg-surface-2 px-2.5 py-1.5 font-mono text-xs shadow-xl">
      <span className="text-text-faint">p≈{label} </span>
      <span className="font-semibold text-text">{payload[0].value.toLocaleString('en-US')}</span>
    </div>
  )
}

function FlaggedRow({ s }) {
  const [open, setOpen] = useState(false)
  const t = FRAUD_TYPE[s.type]
  const sev = s.probability >= 0.8 ? 'danger' : s.probability >= 0.6 ? 'warning' : 'info'
  return (
    <div
      className={cn(
        'relative rounded-md border bg-surface-2/40 transition-colors',
        open ? 'border-border-hi' : 'border-border hover:border-border-hi',
      )}
    >
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
        <span
          className="font-mono text-xs font-semibold tabular-nums"
          style={{ color: sev === 'danger' ? '#ef4444' : sev === 'warning' ? '#f97316' : '#3b82f6' }}
        >
          {s.probability.toFixed(2)}
        </span>
        <span className="font-mono text-xs text-text">{s.id}</span>
        <Badge variant={t.color} className="hidden sm:inline-flex">
          {t.label}
        </Badge>
        <span className="ml-auto hidden min-w-0 truncate text-xs text-text-dim md:block">{s.reason}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-text-faint transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-3 py-3">
              <p className="text-[13px] leading-relaxed text-text-dim">{s.detail}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {s.evidence.map((e) => (
                  <span
                    key={e}
                    className="rounded border border-border-hi bg-surface px-2 py-0.5 font-mono text-[11px] text-text-faint"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function paintAccount(node, ctx, globalScale) {
  const r = node.ringleader ? 6 : 4
  ctx.beginPath()
  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
  ctx.fillStyle = node.ringleader ? '#ef4444' : '#8b5cf6'
  ctx.fill()
  ctx.lineWidth = 0.8
  ctx.strokeStyle = node.ringleader ? 'rgba(239,68,68,0.4)' : 'rgba(139,92,246,0.35)'
  ctx.stroke()
  const fontSize = Math.max(2.5, 9 / globalScale)
  ctx.font = `${fontSize}px JetBrains Mono, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#64748b'
  ctx.fillText(node.id, node.x, node.y + r + 1)
}

export default function FraudDetection() {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const fgRef = useRef(null)

  const stats = [
    { label: 'Scanned', value: fraudSummary.scanned.toLocaleString('en-US'), color: 'text-text' },
    { label: 'Flagged', value: fraudSummary.flagged, color: 'text-warning' },
    { label: 'High-risk', value: fraudSummary.highRisk, color: 'text-danger' },
    { label: 'Syndicates', value: fraudSummary.syndicates, color: 'text-violet' },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
            Fraud Detection
          </h1>
          <p className="mt-1.5 text-sm text-text-dim">
            Surface GPS spoofing, ghost deliveries, and COD syndicate behaviour across recent shipments.
          </p>
        </div>
        <Button onClick={() => setBusy(true)} disabled={busy} size="lg" icon={ScanSearch}>
          Scan Recent Shipments
        </Button>
      </div>

      <ResultArea
        busy={busy}
        hasResult={done}
        processingLabel={`Analyzing ${TOTAL_SCANNED.toLocaleString('en-US')} shipments`}
        processingStages={['Loading shipments', 'Scoring fraud signals', 'Clustering COD accounts']}
        processingDuration={1500}
        onComplete={() => {
          setDone(true)
          setBusy(false)
        }}
        idle={
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-border-hi bg-surface-2 text-text-faint">
              <ScanSearch className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <p className="mt-4 font-mono text-sm text-text-dim">No scan run yet</p>
            <p className="mt-1.5 text-xs text-text-faint">
              Run a scan to score recent shipments and detect fraud clusters.
            </p>
          </div>
        }
      >
        {done && (
          <div className="space-y-4">
            {/* summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-md border border-border bg-surface-2/50 p-3">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-text-faint">{s.label}</p>
                  <p className={cn('mt-1 font-mono text-2xl font-semibold tabular-nums', s.color)}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* histogram */}
              <Card title="Fraud Probability Distribution" subtitle="All scanned shipments" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={fraudDistribution} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="bucket" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#1f2937' }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip cursor={{ fill: 'rgba(148,163,184,0.06)' }} content={<HistTooltip />} />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]} animationDuration={800}>
                      {fraudDistribution.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* syndicate graph */}
              <Card title="COD Syndicate Cluster" subtitle="12 accounts · shared attributes" icon={Network}>
                <div className="rounded-md border border-border bg-bg/40 bg-grid">
                  <NetworkGraph data={syndicateGraph} height={220} fgRef={fgRef} nodeCanvasObject={paintAccount} />
                </div>
                <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-text-faint">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Ringleader</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet" /> Linked account</span>
                </div>
              </Card>
            </div>

            {/* flagged list */}
            <Card title="Flagged Shipments" subtitle="Click a row to expand the evidence" icon={ShieldAlert} bodyClassName="space-y-2">
              {flaggedShipments.map((s) => (
                <FlaggedRow key={s.id} s={s} />
              ))}
            </Card>
          </div>
        )}
      </ResultArea>
    </div>
  )
}
