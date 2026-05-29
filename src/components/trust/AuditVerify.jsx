import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FileLock2, ShieldCheck, ShieldAlert, Loader2, GitMerge } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'

/** Flip a few hex chars so a tampered record shows a visibly different recompute. */
function corruptHash(hash) {
  const arr = hash.split('')
  const map = { a: '4', '3': 'e', '7': '1', f: '9', c: '0' }
  for (const i of [5, 12, 30, 51, 62]) arr[i] = map[arr[i]] ?? '0'
  return arr.join('')
}

function HashRow({ label, value, danger }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-faint">{label}</p>
      <p
        className={cn(
          'break-all rounded border bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed',
          danger ? 'border-danger/30 text-danger' : 'border-border text-text-dim',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export default function AuditVerify({ dataset }) {
  const [recordId, setRecordId] = useState(dataset.records[0]?.id ?? '')
  const [state, setState] = useState('idle') // idle | verifying | result
  const [result, setResult] = useState(null)

  // reset selection if dataset changes
  const validId = dataset.records.some((r) => r.id === recordId)
  const currentId = validId ? recordId : dataset.records[0]?.id

  function verify() {
    setState('verifying')
    setResult(null)
    setTimeout(() => {
      const rec = dataset.records.find((r) => r.id === currentId)
      setResult({
        tampered: !!rec?.tampered,
        hash: rec?.hash ?? '',
        recomputed: rec?.tampered ? corruptHash(rec.hash) : rec?.hash ?? '',
      })
      setState('result')
    }, 700)
  }

  const intact = result && !result.tampered

  return (
    <Card title="Verify Audit Trail" subtitle="Cryptographic provenance check" icon={FileLock2}>
      <div className="grid gap-4 md:grid-cols-2">
        {/* controls */}
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-text-faint">
              Record ID
            </label>
            <div className="relative">
              <select
                value={currentId}
                onChange={(e) => {
                  setRecordId(e.target.value)
                  setState('idle')
                  setResult(null)
                }}
                className="w-full appearance-none rounded-md border border-border-hi bg-surface-2 px-3 py-2 pr-9 font-mono text-xs text-text outline-none transition-colors hover:border-accent/50 focus:border-accent"
              >
                {dataset.records.map((r) => (
                  <option key={r.id} value={r.id} className="bg-surface-2">
                    {r.id}
                    {r.tampered ? '  ⚠' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-text-faint">
            Recomputes the record hash and re-derives it against the Merkle root in
            the append-only log. Any change to the underlying data breaks the chain.
          </p>

          <Button onClick={verify} disabled={state === 'verifying'} className="w-full" variant="secondary">
            {state === 'verifying' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                Verifying…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
                Verify Hash
              </>
            )}
          </Button>
        </div>

        {/* result */}
        <div className="rounded-md border border-border bg-surface-2/40 p-3">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[150px] items-center justify-center text-center"
              >
                <p className="font-mono text-xs text-text-faint">
                  Select a record and run verification.
                </p>
              </motion.div>
            )}

            {state === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[150px] flex-col items-center justify-center gap-2 text-center"
              >
                <Loader2 className="h-5 w-5 animate-spin text-accent" strokeWidth={2.5} />
                <p className="font-mono text-xs text-text-dim">Recomputing hash chain…</p>
              </motion.div>
            )}

            {state === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3 py-2',
                    intact
                      ? 'border-success/40 bg-success/10 text-success'
                      : 'border-danger/40 bg-danger/10 text-danger',
                  )}
                >
                  {intact ? (
                    <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <ShieldAlert className="h-5 w-5" strokeWidth={2.5} />
                  )}
                  <span className="font-mono text-sm font-semibold">
                    {intact ? '✓ INTACT' : '⚠ TAMPERED'}
                  </span>
                  <span className="ml-auto font-mono text-[10px] opacity-80">
                    {intact ? 'chain verified' : 'hash mismatch'}
                  </span>
                </div>

                <HashRow label="Logged SHA-256" value={result.hash} />
                {!intact && <HashRow label="Recomputed SHA-256" value={result.recomputed} danger />}
                <div className="flex items-start gap-1.5">
                  <GitMerge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-faint" strokeWidth={2} />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
                      Merkle root
                    </p>
                    <p className="break-all font-mono text-[11px] text-text-dim">
                      {dataset.merkleRoot}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  )
}
