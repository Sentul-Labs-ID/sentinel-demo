import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldAlert, AlertTriangle, GitBranch, Bell } from 'lucide-react'
import { alertPool, seedAlerts } from '../../data/shipments'
import { cn } from '../../lib/utils'

const SEVERITY = {
  danger: { dot: 'bg-danger', text: 'text-danger', rail: 'before:bg-danger' },
  warning: { dot: 'bg-warning', text: 'text-warning', rail: 'before:bg-warning' },
  info: { dot: 'bg-info', text: 'text-info', rail: 'before:bg-info' },
}

const TYPE_ICON = {
  'SLA Risk': AlertTriangle,
  'Fraud Flag': ShieldAlert,
  'Cascade Warning': GitBranch,
}

let uidCounter = 0
const uid = () => `alert-${uidCounter++}`

function relativeTime(ageMs) {
  const s = Math.floor(ageMs / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

function AlertCard({ alert, now }) {
  const sev = SEVERITY[alert.severity]
  const Icon = TYPE_ICON[alert.type] ?? AlertTriangle
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={cn(
        'relative rounded-md border border-border bg-surface-2/60 p-3 pl-4',
        'before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-l-md before:content-[""]',
        sev.rail,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn('inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide', sev.text)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          {alert.type}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-text-faint">
          {relativeTime(now - alert.ts)}
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-snug text-text-dim">{alert.message}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={cn('h-1.5 w-1.5 rounded-full', sev.dot)} />
        <span className="font-mono text-[11px] text-text-faint">{alert.shipment}</span>
      </div>
    </motion.div>
  )
}

export default function AlertsFeed() {
  const startTs = useRef(Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [alerts, setAlerts] = useState(() =>
    seedAlerts.map((a) => ({ ...a, key: uid(), ts: startTs.current - a.ageSec * 1000 })),
  )
  const poolIdx = useRef(1)

  // live: prepend a new alert every ~4.5s, cap the list
  useEffect(() => {
    const id = setInterval(() => {
      const tpl = alertPool[poolIdx.current % alertPool.length]
      poolIdx.current += 1
      setAlerts((prev) =>
        [{ ...tpl, key: uid(), ts: Date.now() }, ...prev].slice(0, 7),
      )
    }, 4500)
    return () => clearInterval(id)
  }, [])

  // tick relative timestamps every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const activeCount = alerts.filter((a) => a.severity !== 'info').length

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border-hi bg-surface-2 text-text-dim">
            <Bell className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text">Active Alerts</h3>
            <p className="text-xs text-text-faint">Real-time signal feed</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded border border-danger/30 bg-danger/10 px-2 py-0.5 font-mono text-[11px] font-medium text-danger">
          {activeCount} active
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {alerts.map((a) => (
            <AlertCard key={a.key} alert={a} now={now} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
