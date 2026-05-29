import { cn } from '../../lib/utils'

const VARIANTS = {
  neutral: 'bg-surface-2 text-text-dim border-border-hi',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
  accent: 'bg-accent/10 text-accent border-accent/40',
  violet: 'bg-violet/10 text-violet border-violet/30',
}

export default function Badge({
  children,
  variant = 'neutral',
  dot = false,
  mono = true,
  className,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        mono && 'font-mono',
        VARIANTS[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'info' && 'bg-info',
            variant === 'accent' && 'bg-accent',
            variant === 'violet' && 'bg-violet',
            variant === 'neutral' && 'bg-text-faint',
          )}
        />
      )}
      {children}
    </span>
  )
}
