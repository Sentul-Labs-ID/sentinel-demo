import { cn } from '../../lib/utils'

/**
 * Surface card with optional header (title + subtitle) and an action slot.
 *
 * <Card title="Active Alerts" subtitle="Last 24h" action={<Button .../>}>
 *   ...
 * </Card>
 */
export default function Card({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  highlight = false,
  className,
  bodyClassName,
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-md border bg-surface',
        highlight
          ? 'border-accent/50 shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_8px_30px_-12px_rgba(245,158,11,0.25)]'
          : 'border-border',
        className,
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                  highlight
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border-hi bg-surface-2 text-text-dim',
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="truncate text-sm font-semibold text-text">{title}</h3>
              )}
              {subtitle && (
                <p className="truncate text-xs text-text-faint">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </div>
  )
}
