import { motion } from 'framer-motion'
import ProcessingOverlay from '../ui/ProcessingOverlay'

/**
 * Shared right-hand panel for the input→process→result demo screens.
 * Hosts the ProcessingOverlay, an idle empty-state, and the animated result.
 *
 * Pattern: parent holds `busy` + `result`; on submit set busy=true and a
 * pending result, then onComplete reveals it.
 */
export default function ResultArea({
  busy,
  hasResult,
  idle,
  processingLabel,
  processingStages,
  processingDuration = 1000,
  onComplete,
  children,
}) {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-md border border-border bg-surface">
      <ProcessingOverlay
        active={busy}
        label={processingLabel}
        stages={processingStages}
        duration={processingDuration}
        onComplete={onComplete}
      />

      {!hasResult && !busy && (
        <div className="flex min-h-[420px] items-center justify-center p-6">{idle}</div>
      )}

      {hasResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: busy ? 0.4 : 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-4 sm:p-5"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}
