import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, animate } from 'framer-motion'
import { Check, Loader2, FileCheck2, Crosshair, FileLock2, Terminal } from 'lucide-react'
import Sparkline from '../ui/Sparkline'
import { cn } from '../../lib/utils'

const STAGES = [
  { key: 'validator', label: 'Integrity Validator', icon: FileCheck2 },
  { key: 'anomaly', label: 'Anomaly Cross-Check', icon: Crosshair },
  { key: 'audit', label: 'Cryptographic Audit Log', icon: FileLock2 },
]

const DURATION = 1500

function useCountUp(value, duration = 1) {
  const [d, setD] = useState(0)
  useEffect(() => {
    const c = animate(0, value, { duration, ease: 'easeOut', onUpdate: (v) => setD(v) })
    return () => c.stop()
  }, [value, duration])
  return Math.round(d)
}

function Counter({ label, value, color, spark }) {
  const shown = useCountUp(value, 1.1)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-md border border-border bg-surface-2/60 p-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
          {label}
        </span>
        <Sparkline data={spark} color={color} width={52} height={16} />
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums" style={{ color }}>
        {shown.toLocaleString('en-US')}
      </div>
    </motion.div>
  )
}

function Idle() {
  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border-hi bg-surface-2 text-text-faint">
        <Terminal className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <p className="mt-4 font-mono text-sm text-text-dim">Awaiting input…</p>
      <p className="mt-1.5 max-w-xs text-xs text-text-faint">
        Load a dataset and run validation to scan every record for tampering and
        anomalies before it is trusted.
      </p>
    </div>
  )
}

function Running({ progress, stageIdx }) {
  return (
    <div className="flex h-full min-h-[260px] flex-col justify-center">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-sm font-medium text-text">
          Validating records<span className="text-accent">…</span>
        </span>
        <span className="font-mono text-xs tabular-nums text-text-dim">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
      <ul className="mt-5 space-y-2.5">
        {STAGES.map((s, i) => {
          const done = i < stageIdx || progress >= 100
          const current = i === stageIdx && progress < 100
          const Icon = s.icon
          return (
            <li
              key={s.key}
              className={cn(
                'flex items-center gap-3 rounded-md border px-3 py-2 transition-colors',
                done
                  ? 'border-success/30 bg-success/5'
                  : current
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-border bg-surface-2/40',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md',
                  done ? 'text-success' : current ? 'text-accent' : 'text-text-faint',
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : current ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Icon className="h-4 w-4" strokeWidth={2} />
                )}
              </span>
              <span
                className={cn(
                  'font-mono text-sm',
                  done ? 'text-success' : current ? 'text-text' : 'text-text-faint',
                )}
              >
                {s.label}
              </span>
              {done && (
                <span className="ml-auto font-mono text-[11px] text-success">OK</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Right-hand panel of the demo zone. Drives the scripted validation animation
 * when `running` flips true, then reveals the four animated counters.
 */
export default function ValidationPanel({ dataset, phase, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const rafRef = useRef(null)
  const doneRef = useRef(onComplete)
  doneRef.current = onComplete

  useEffect(() => {
    if (phase !== 'running') return
    setProgress(0)
    setStageIdx(0)
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased * 100)
      setStageIdx(Math.min(STAGES.length - 1, Math.floor(t * STAGES.length)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setProgress(100)
        setTimeout(() => doneRef.current?.(), 200)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  return (
    <div className="flex h-full flex-col">
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" exit={{ opacity: 0 }} className="flex-1">
            <Idle />
          </motion.div>
        )}
        {phase === 'running' && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <Running progress={progress} stageIdx={stageIdx} />
          </motion.div>
        )}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1"
          >
            <div className="mb-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-success" strokeWidth={3} />
              <span className="font-mono text-sm text-text">
                Validation complete
                <span className="text-text-faint"> · {dataset.name}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dataset.counters.map((c) => (
                <Counter key={c.key} label={c.label} value={c.value} color={c.color} spark={c.spark} />
              ))}
            </div>
            <p className="mt-3 font-mono text-[11px] text-text-faint">
              {((dataset.summary.valid / dataset.summary.total) * 100).toFixed(1)}% of records
              passed all integrity checks.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
