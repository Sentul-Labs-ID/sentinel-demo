import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

/** Labelled field wrapper. */
export function Field({ label, hint, children, className }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
          {label}
        </label>
        {hint && <span className="font-mono text-[11px] text-text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

/** Styled native select. options: [{ value, label }] */
export function Select({ value, onChange, options, disabled, className }) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-md border border-border-hi bg-surface-2 px-3 py-2 pr-9 text-sm text-text outline-none transition-colors hover:border-accent/50 focus:border-accent disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-2">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
    </div>
  )
}

/** Segmented radio pills. options: [{ value, label }] */
export function RadioPills({ value, onChange, options, disabled }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-md border border-border-hi bg-surface-2 p-1">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded px-2 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-bg'
                : 'text-text-dim hover:bg-surface hover:text-text',
              disabled && 'opacity-50',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Range slider with a live mono value readout. */
export function Slider({ value, onChange, min, max, step = 1, unit = '', disabled }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-lg font-semibold tabular-nums text-text">
          {value.toLocaleString('en-US')}
          <span className="ml-1 text-xs text-text-dim">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-accent h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, #f59e0b ${pct}%, #1f2937 ${pct}%)`,
        }}
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-text-faint">
        <span>{min.toLocaleString('en-US')}</span>
        <span>{max.toLocaleString('en-US')}</span>
      </div>
    </div>
  )
}
