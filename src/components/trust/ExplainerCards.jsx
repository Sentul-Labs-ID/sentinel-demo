import { motion } from 'framer-motion'
import { FileCheck2, Crosshair, FileLock2, Check } from 'lucide-react'

const CARDS = [
  {
    n: '1',
    title: 'Data Integrity Validator',
    icon: FileCheck2,
    bullets: [
      'JSON schema & type enforcement',
      'Physical plausibility bounds',
      'Velocity / acceleration checks',
      'Source signature verification',
    ],
  },
  {
    n: '2',
    title: 'Anomaly Cross-Check',
    icon: Crosshair,
    bullets: [
      'Statistical baseline model',
      'Z-score outlier detection',
      'Multi-source corroboration',
      'Per-source reliability scoring',
    ],
  },
  {
    n: '3',
    title: 'Cryptographic Audit Log',
    icon: FileLock2,
    bullets: [
      'SHA-256 record hashing',
      'Merkle-tree aggregation',
      'Append-only event log',
      'End-to-end provenance chain',
    ],
  },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function ExplainerCards() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid gap-3 md:grid-cols-3"
    >
      {CARDS.map((c) => {
        const Icon = c.icon
        return (
          <motion.div
            key={c.n}
            variants={fadeUp}
            className="rounded-md border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xs text-text-faint">{c.n}</span>
                <h3 className="text-sm font-semibold text-text">{c.title}</h3>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {c.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[13px] text-text-dim">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
