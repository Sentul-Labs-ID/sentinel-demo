import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/nav'
import { cn } from '../../lib/utils'

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5">
      <span className="relative flex h-7 w-7 items-center justify-center rounded-[5px] border border-accent/40 bg-accent/10">
        <span className="h-2.5 w-2.5 rounded-[2px] bg-accent" />
      </span>
      <div className="leading-none">
        <div className="font-mono text-[15px] font-bold tracking-tight text-text">
          SENTINEL
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          Logistics Intel
        </div>
      </div>
    </div>
  )
}

function NavItem({ item, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
          isActive
            ? item.star
              ? 'bg-accent/10 text-accent'
              : 'bg-surface text-text'
            : item.star
              ? 'text-accent/80 hover:bg-accent/5 hover:text-accent'
              : 'text-text-dim hover:bg-surface hover:text-text',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* active rail */}
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-all duration-200',
              isActive
                ? item.star
                  ? 'bg-accent opacity-100'
                  : 'bg-text opacity-100'
                : 'opacity-0',
            )}
          />
          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0',
              item.star && !isActive && 'text-accent/80',
            )}
            strokeWidth={2}
          />
          <span className="truncate font-medium">{item.label}</span>
          {item.star && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
          )}
        </>
      )}
    </NavLink>
  )
}

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <Logo />

      <div className="mx-4 mb-2 h-px bg-border" />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 scrollbar-thin">
        <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
          Modules
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* footer */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            Demo
          </span>
          <span className="font-mono text-[10px] text-text-faint">v0.1.0</span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-text-faint">
          Built by{' '}
          <span className="font-medium text-text-dim">Sentul Labs</span>
          <br />
          AI Open Innovation Challenge 2026
        </p>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop: fixed left rail */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface-2 lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile: slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 top-0 h-full w-60 border-r border-border bg-surface-2"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-5 rounded p-1 text-text-dim hover:bg-surface hover:text-text"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={onClose} />
          </motion.div>
        </div>
      )}
    </>
  )
}
