import { UploadCloud, ChevronDown, ShieldCheck, FileText, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import ValidationPanel from './ValidationPanel'
import { datasets } from '../../data/mockResults'
import { cn } from '../../lib/utils'

/**
 * The centerpiece. Left column: load a dataset (mock upload + sample picker)
 * and trigger validation. Right column: the scripted validation animation.
 */
export default function DemoZone({
  dataset,
  selectedId,
  onSelect,
  onUpload,
  uploaded,
  phase,
  onValidate,
  onComplete,
}) {
  const running = phase === 'running'

  return (
    <div className="overflow-hidden rounded-md border border-accent/40 bg-surface shadow-[0_0_0_1px_rgba(245,158,11,0.10),0_18px_50px_-28px_rgba(245,158,11,0.4)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent">
            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text">Validation Console</h3>
            <p className="text-xs text-text-faint">Zero-trust record validation</p>
          </div>
        </div>
        <span className="font-mono text-[11px] text-text-faint">
          {phase === 'done' ? 'COMPLETE' : running ? 'RUNNING' : 'READY'}
        </span>
      </div>

      <div className="grid gap-px bg-border lg:grid-cols-5">
        {/* LEFT — controls */}
        <div className="space-y-4 bg-surface p-4 lg:col-span-2">
          {/* upload */}
          <button
            type="button"
            onClick={onUpload}
            disabled={running}
            className={cn(
              'group flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-center transition-colors',
              uploaded
                ? 'border-accent/40 bg-accent/5'
                : 'border-border-hi bg-surface-2/40 hover:border-accent/50 hover:bg-accent/5',
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md border',
                uploaded
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border-hi bg-surface text-text-dim group-hover:text-accent',
              )}
            >
              <UploadCloud className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-sm font-medium text-text">
              {uploaded ? 'Dataset loaded' : 'Drop shipment data'}
            </span>
            <span className="text-xs text-text-faint">
              {uploaded ? 'Click to reload sample' : 'or click to load a sample set'}
            </span>
          </button>

          {/* sample picker */}
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-text-faint">
              Or select sample
            </label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => onSelect(e.target.value)}
                disabled={running}
                className="w-full appearance-none rounded-md border border-border-hi bg-surface-2 px-3 py-2 pr-9 text-sm text-text outline-none transition-colors hover:border-accent/50 focus:border-accent disabled:opacity-50"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id} className="bg-surface-2">
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            </div>
          </div>

          {/* loaded file chip */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2/50 px-3 py-2">
            <FileText className="h-4 w-4 shrink-0 text-text-faint" strokeWidth={2} />
            <div className="min-w-0">
              <p className="truncate font-mono text-xs text-text-dim">{dataset.fileName}</p>
              <p className="font-mono text-[10px] text-text-faint">
                {dataset.summary.total.toLocaleString('en-US')} records
              </p>
            </div>
          </div>

          {/* validate */}
          <Button
            onClick={onValidate}
            disabled={running}
            size="lg"
            className="w-full"
            icon={running ? undefined : ShieldCheck}
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Validating…
              </>
            ) : (
              'Validate Now'
            )}
          </Button>
        </div>

        {/* RIGHT — live validation */}
        <motion.div layout className="bg-surface p-4 lg:col-span-3">
          <ValidationPanel dataset={dataset} phase={phase} onComplete={onComplete} />
        </motion.div>
      </div>
    </div>
  )
}
