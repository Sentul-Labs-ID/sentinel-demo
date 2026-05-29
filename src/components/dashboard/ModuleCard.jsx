import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Star } from 'lucide-react'
import Badge from '../ui/Badge'
import { cn } from '../../lib/utils'

/**
 * Entry-point card for a module on the dashboard grid.
 * The Trust Layer card (star) gets an amber border + glow + DIFFERENTIATOR badge.
 */
export default function ModuleCard({ item, index }) {
  const Icon = item.icon
  const num = String(index + 1).padStart(2, '0')
  const star = item.star

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
      }}
    >
      <Link
        to={item.path}
        className={cn(
          'group relative flex h-full flex-col rounded-md border bg-surface p-4 transition-all duration-150',
          star
            ? 'border-accent/50 shadow-[0_0_0_1px_rgba(245,158,11,0.10),0_10px_30px_-16px_rgba(245,158,11,0.45)] hover:border-accent'
            : 'border-border hover:-translate-y-0.5 hover:border-border-hi',
        )}
      >
        {star && (
          <span
            className="pointer-events-none absolute inset-0 rounded-md opacity-60"
            style={{
              background:
                'radial-gradient(120% 80% at 80% 0%, rgba(245,158,11,0.10), transparent 60%)',
            }}
          />
        )}

        <div className="relative flex items-start justify-between">
          <span className="font-mono text-xs text-text-faint">// {num}</span>
          {star ? (
            <Badge variant="accent" className="gap-1">
              <Star className="h-3 w-3 fill-accent" strokeWidth={0} />
              Differentiator
            </Badge>
          ) : (
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md border border-border-hi bg-surface-2 text-text-dim',
                'transition-colors group-hover:text-text',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
          )}
        </div>

        <div className="relative mt-3 flex items-center gap-2">
          {star && <Icon className="h-4 w-4 text-accent" strokeWidth={2.25} />}
          <h3 className={cn('text-sm font-semibold', star ? 'text-accent' : 'text-text')}>
            {item.label}
          </h3>
        </div>

        <p className="relative mt-1.5 flex-1 text-[13px] leading-snug text-text-faint">
          {item.description}
        </p>

        <div className="relative mt-4 flex items-center justify-between">
          <Badge variant={star ? 'accent' : 'neutral'}>{item.tech}</Badge>
          <span
            className={cn(
              'inline-flex items-center gap-1 font-mono text-xs font-medium transition-colors',
              star ? 'text-accent' : 'text-text-dim group-hover:text-text',
            )}
          >
            Open
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
