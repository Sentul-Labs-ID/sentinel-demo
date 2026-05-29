import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Menu, Search, ChevronRight } from 'lucide-react'
import { navItemByPath } from '../../lib/nav'
import { nowWIB } from '../../lib/utils'

function useClock() {
  const [t, setT] = useState(() => nowWIB())
  useEffect(() => {
    const id = setInterval(() => setT(nowWIB()), 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

export default function TopBar({ onOpenMobileNav }) {
  const { pathname } = useLocation()
  const item = navItemByPath(pathname)
  const clock = useClock()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-md sm:px-6">
      {/* mobile nav toggle */}
      <button
        onClick={onOpenMobileNav}
        className="rounded-md border border-border-hi p-1.5 text-text-dim hover:text-text lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* breadcrumb */}
      <nav className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
          SENTINEL
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-text-faint" />
        <span className="truncate font-medium text-text">
          {item?.label ?? 'Overview'}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* mock search */}
        <button className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-faint transition-colors hover:border-border-hi md:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search shipments…</span>
          <kbd className="ml-3 rounded border border-border-hi bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-text-dim">
            ⌘K
          </kbd>
        </button>

        {/* WIB clock */}
        <div className="hidden flex-col items-end leading-none sm:flex">
          <span className="font-mono text-sm font-medium tabular-nums text-text">
            {clock.time}
            <span className="ml-1 text-[10px] text-text-faint">WIB</span>
          </span>
          <span className="mt-0.5 font-mono text-[10px] text-text-faint">
            {clock.date}
          </span>
        </div>

        {/* notification bell */}
        <button
          className="relative rounded-md border border-border bg-surface p-2 text-text-dim transition-colors hover:border-border-hi hover:text-text"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
        </button>
      </div>
    </header>
  )
}
