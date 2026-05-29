import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import ExplainerCards from '../components/trust/ExplainerCards'
import DemoZone from '../components/trust/DemoZone'
import ResultsTable from '../components/trust/ResultsTable'
import AuditVerify from '../components/trust/AuditVerify'
import WhatThisPrevents from '../components/trust/WhatThisPrevents'
import { datasetById, datasets } from '../data/mockResults'

export default function TrustLayer() {
  const [selectedId, setSelectedId] = useState(datasets[0].id)
  const [uploaded, setUploaded] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | running | done

  const dataset = datasetById[selectedId]

  function handleSelect(id) {
    setSelectedId(id)
    setPhase('idle')
  }
  function handleUpload() {
    setSelectedId(datasets[0].id)
    setUploaded(true)
    setPhase('idle')
  }
  function handleValidate() {
    setPhase('running')
  }

  const showResults = phase === 'done'

  return (
    <div className="space-y-8">
      {/* header */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
            Trust &amp; Resilience Layer
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-accent">
            <Star className="h-3 w-3 fill-accent" strokeWidth={0} />
            Key Differentiator
          </span>
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-text-dim">
          A zero-trust integrity layer that validates every record for tampering and
          anomalies — and cryptographically proves it — before any downstream model
          is allowed to trust the data.
        </p>
      </div>

      {/* 1. three explainers */}
      <ExplainerCards />

      {/* 2. demo zone */}
      <DemoZone
        dataset={dataset}
        selectedId={selectedId}
        onSelect={handleSelect}
        onUpload={handleUpload}
        uploaded={uploaded}
        phase={phase}
        onValidate={handleValidate}
        onComplete={() => setPhase('done')}
      />

      {/* 3. results + audit (after validation) */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <ResultsTable dataset={dataset} />
            <AuditVerify dataset={dataset} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. what this prevents */}
      <WhatThisPrevents />
    </div>
  )
}
