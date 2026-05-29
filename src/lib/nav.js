import {
  LayoutDashboard,
  Clock,
  GaugeCircle,
  Leaf,
  ShieldCheck,
  ScanSearch,
  Route,
  Network,
} from 'lucide-react'

/**
 * Single source of truth for the 8 modules.
 * Used by the Sidebar, TopBar breadcrumb, and App routing.
 *
 * `star: true` marks the Trust & Resilience Layer — the signature module,
 * highlighted in amber throughout the UI.
 */
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    path: '/',
    label: 'Dashboard',
    short: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Unified command center',
  },
  {
    id: 'delay',
    path: '/delay',
    label: 'Delay Prediction',
    short: 'Delay',
    icon: Clock,
    description: 'Predicts delivery delay from traffic, weather & driver patterns.',
    tech: 'Gradient Boosting',
  },
  {
    id: 'sla',
    path: '/sla',
    label: 'SLA Risk',
    short: 'SLA Risk',
    icon: GaugeCircle,
    description: 'Scores each shipment’s risk of breaching its delivery SLA.',
    tech: 'Risk Classifier',
  },
  {
    id: 'carbon',
    path: '/carbon',
    label: 'Carbon Footprint',
    short: 'Carbon',
    icon: Leaf,
    description: 'Per-shipment emissions, aligned with GHG Protocol Scope 3.',
    tech: 'GHG Scope 3',
  },
  {
    id: 'trust',
    path: '/trust',
    label: 'Trust Layer',
    short: 'Trust Layer',
    icon: ShieldCheck,
    description: 'Validates every record for tampering before it is trusted.',
    tech: 'SHA-256 · Merkle',
    star: true,
  },
  {
    id: 'fraud',
    path: '/fraud',
    label: 'Fraud Detection',
    short: 'Fraud',
    icon: ScanSearch,
    description: 'Detects GPS spoofing, ghost deliveries & COD syndicates.',
    tech: 'Graph + Isolation Forest',
  },
  {
    id: 'route',
    path: '/route',
    label: 'Route Optimization',
    short: 'Route',
    icon: Route,
    description: 'Balances time, cost & carbon across a Pareto frontier.',
    tech: 'Multi-objective',
  },
  {
    id: 'cascade',
    path: '/cascade',
    label: 'Cascade Simulator',
    short: 'Cascade',
    icon: Network,
    description: 'Predicts how one hub disruption ripples across the network.',
    tech: 'Graph Propagation',
  },
]

/** The analytical modules (everything except the Dashboard home). */
export const MODULES = NAV_ITEMS.filter((item) => item.id !== 'dashboard')

/** Look up a nav item by pathname (exact match). */
export function navItemByPath(pathname) {
  return NAV_ITEMS.find((item) => item.path === pathname)
}
