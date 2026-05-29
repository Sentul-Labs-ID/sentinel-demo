import { motion } from 'framer-motion'
import { Navigation, Bug, Leaf } from 'lucide-react'

const ITEMS = [
  {
    icon: Navigation,
    title: 'GPS spoofing by drivers',
    body: 'Velocity and teleport checks catch coordinates that jump faster than physics allows — fake "delivered" pings are rejected.',
  },
  {
    icon: Bug,
    title: 'Data poisoning of traffic APIs',
    body: 'Multi-source corroboration and reliability scoring quarantine feeds whose readings drift from the statistical baseline.',
  },
  {
    icon: Leaf,
    title: 'Greenwashing of carbon records',
    body: 'Every emissions figure is hashed into an append-only log, so reported CO₂e can be audited and cannot be quietly revised.',
  },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function WhatThisPrevents() {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-text-faint">
        What this prevents
      </p>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="grid gap-3 md:grid-cols-3"
      >
        {ITEMS.map((it) => {
          const Icon = it.icon
          return (
            <motion.div
              key={it.title}
              variants={fadeUp}
              className="rounded-md border border-border bg-surface p-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-danger/30 bg-danger/10 text-danger">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-text">{it.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-faint">{it.body}</p>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
