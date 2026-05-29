import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

/**
 * Full application layout: fixed sidebar (left) + main column (topbar + content).
 * The content area is centered with a max width and scrolls independently.
 */
export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMobileNav={() => setMobileOpen(true)} />

        <main
          key={pathname}
          className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-content">{children}</div>
        </main>
      </div>
    </div>
  )
}
