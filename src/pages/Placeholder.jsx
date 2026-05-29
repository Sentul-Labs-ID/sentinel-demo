import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Badge from '../components/ui/Badge'
import { cn } from '../lib/utils'

/**
 * Temporary screen rendered for modules not yet built.
 * Designed to still feel intentional and on-brand, not a blank "TODO".
 */
export default function Placeholder({ item }) {
  const Icon = item.icon
  const star = item.star

  return (
    <div>
      {/* page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
              {item.label}
            </h1>
            {star && (
              <Badge variant="accent" dot>
                Signature
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-sm text-text-dim">{item.description}</p>
        </div>
      </div>

      {/* empty-state canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-md border bg-surface bg-grid text-center',
          star ? 'border-accent/40' : 'border-border',
        )}
      >
        {/* radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: star
              ? 'radial-gradient(420px circle at 50% 38%, rgba(245,158,11,0.10), transparent 70%)'
              : 'radial-gradient(420px circle at 50% 38%, rgba(59,130,246,0.06), transparent 70%)',
          }}
        />

        <span
          className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-lg border',
            star
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border-hi bg-surface-2 text-text-dim',
          )}
        >
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </span>

        <h2 className="relative mt-5 font-mono text-sm font-medium text-text">
          {item.label} — coming next
        </h2>
        <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-text-faint">
          This module is part of the SENTINEL prototype and is being wired up.
          The shell, design system, and navigation are live.
        </p>

        <div className="relative mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          Module scaffold ready
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </motion.div>
    </div>
  )
}
