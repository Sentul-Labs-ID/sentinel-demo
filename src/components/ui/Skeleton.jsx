import { cn } from '../../lib/utils'

/**
 * Loading placeholder with a subtle shimmer sweep.
 *
 * <Skeleton className="h-4 w-32" />
 * <Skeleton.Text lines={3} />
 */
export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded bg-surface-2',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent',
        className,
      )}
    />
  )
}

Skeleton.Text = function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}
