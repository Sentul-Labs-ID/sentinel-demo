import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Count-up hook: animates from 0 to `value` once on mount (or when value changes).
 * Respects prefers-reduced-motion by jumping straight to the value.
 */
function useCountUp(value, { duration = 1.1, decimals = 0 } = {}) {
  const [display, setDisplay] = useState(0)
  const nodeRef = useRef(value)
  nodeRef.current = value

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [value, duration])

  const factor = Math.pow(10, decimals)
  const rounded = Math.round(display * factor) / factor
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Hero metric tile with animated count-up and a delta indicator.
 *
 * <StatTile label="On-Time Rate" value={94.2} decimals={1} suffix="%"
 *           delta={2.1} deltaSuffix="%" trend="up" />
 */
export default function StatTile({
  label,
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  delta,
  deltaSuffix = '%',
  trend, // 'up' | 'down'
  deltaPositive, // override: is the delta "good"? defaults to trend === 'up'
  icon: Icon,
  className,
}) {
  const shown = useCountUp(value, { decimals })
  const isUp = trend === 'up'
  const good = deltaPositive ?? isUp
  const DeltaIcon = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-md border border-border bg-surface p-4',
        'transition-colors duration-150 hover:border-border-hi',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-faint">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-text-faint" strokeWidth={2} />}
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="font-mono text-3xl font-semibold leading-none text-text tabular-nums">
          {prefix}
          {shown}
          {suffix && <span className="ml-0.5 text-xl text-text-dim">{suffix}</span>}
        </span>
      </div>

      {delta != null && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-mono text-xs font-medium',
              good ? 'text-success' : 'text-danger',
            )}
          >
            <DeltaIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {Math.abs(delta)}
            {deltaSuffix}
          </span>
          <span className="text-xs text-text-faint">vs. yesterday</span>
        </div>
      )}

      {/* bottom accent line on hover */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-accent/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  )
}
