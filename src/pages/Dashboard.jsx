import { motion } from 'framer-motion'
import { Boxes } from 'lucide-react'
import StatTile from '../components/ui/StatTile'
import Card from '../components/ui/Card'
import LiveOpsMap from '../components/dashboard/LiveOpsMap'
import AlertsFeed from '../components/dashboard/AlertsFeed'
import ModuleCard from '../components/dashboard/ModuleCard'
import { DeliveryPerformanceChart, CarbonTrendChart } from '../components/dashboard/charts'
import { heroStats } from '../data/metrics'
import { MODULES } from '../lib/nav'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// Spec: 6 module entry points on the home grid (Trust = 04). Cascade stays in the sidebar.
const gridModules = MODULES.slice(0, 6)

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-text-faint">
      {children}
    </p>
  )
}

export default function Dashboard() {
  return (
    <div>
      {/* page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
            Operations Command Center
          </h1>
          <p className="mt-1 text-sm text-text-dim">
            Predictive, trustworthy & resilient logistics — at a glance.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded border border-border-hi bg-surface px-2.5 py-1 font-mono text-[11px] text-text-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
          All systems operational
        </span>
      </div>

      {/* hero stat tiles */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {heroStats.map((s) => (
          <motion.div key={s.id} variants={fadeUp}>
            <StatTile {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* main split: live map (60%) + alerts feed (40%) */}
      <div className="mt-4 grid gap-4 lg:h-[468px] lg:grid-cols-5">
        <div className="h-[360px] lg:col-span-3 lg:h-full">
          <LiveOpsMap />
        </div>
        <div className="h-[440px] lg:col-span-2 lg:h-full">
          <AlertsFeed />
        </div>
      </div>

      {/* charts row */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Delivery Performance" subtitle="On-time vs. late · last 7 days">
          <DeliveryPerformanceChart />
        </Card>
        <Card title="Carbon Trend" subtitle="Tonnes CO₂e / day · last 7 days">
          <CarbonTrendChart />
        </Card>
      </div>

      {/* module grid */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Boxes className="h-4 w-4 text-text-faint" strokeWidth={2} />
          <SectionLabel>Modules</SectionLabel>
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {gridModules.map((m, i) => (
            <ModuleCard key={m.id} item={m} index={i} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
