import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Reusable "computing…" overlay that sells the illusion of real processing.
 * Mount it inside a `relative` container; it covers the parent with a blurred
 * backdrop, animates a progress bar, and steps through `stages`, then calls
 * `onComplete` after `duration`.
 *
 * <div className="relative">
 *   <ProcessingOverlay active={busy} label="Validating records"
 *      stages={['Validator', 'Anomaly cross-check', 'Audit log']}
 *      duration={1400} onComplete={() => setBusy(false)} />
 *   ...content...
 * </div>
 */
export default function ProcessingOverlay({
  active,
  label = 'Processing',
  stages = ['Initializing', 'Computing', 'Finalizing'],
  duration = 1200,
  onComplete,
  fullscreen = false,
}) {
  const [progress, setProgress] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const rafRef = useRef(null)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    if (!active) {
      setProgress(0)
      setStageIdx(0)
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased * 100)
      setStageIdx(Math.min(stages.length - 1, Math.floor(t * stages.length)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setProgress(100)
        setStageIdx(stages.length - 1)
        setTimeout(() => completeRef.current?.(), 180)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, duration])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'z-30 flex items-center justify-center',
            fullscreen ? 'fixed inset-0' : 'absolute inset-0',
            'bg-bg/70 backdrop-blur-sm',
          )}
        >
          <div className="w-full max-w-sm px-6">
            <div className="mb-4 flex items-center gap-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={2.5} />
              <span className="font-mono text-sm font-medium text-text">
                {label}
                <span className="text-accent">…</span>
              </span>
              <span className="ml-auto font-mono text-xs tabular-nums text-text-dim">
                {Math.round(progress)}%
              </span>
            </div>

            {/* progress bar */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-accent"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* stage checklist */}
            <ul className="mt-4 space-y-1.5">
              {stages.map((stage, i) => {
                const done = i < stageIdx || progress >= 100
                const current = i === stageIdx && progress < 100
                return (
                  <li
                    key={stage}
                    className={cn(
                      'flex items-center gap-2 font-mono text-xs transition-colors',
                      done
                        ? 'text-success'
                        : current
                          ? 'text-text'
                          : 'text-text-faint',
                    )}
                  >
                    <span className="flex h-4 w-4 items-center justify-center">
                      {done ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : current ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                      )}
                    </span>
                    {stage}
                  </li>
                )
              })}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
