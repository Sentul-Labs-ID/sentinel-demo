import { Loader2 } from 'lucide-react'

/** Lightweight fallback shown while a lazily-loaded screen chunk resolves. */
export default function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-accent" strokeWidth={2.5} />
        <span className="font-mono text-xs text-text-faint">Loading module…</span>
      </div>
    </div>
  )
}
