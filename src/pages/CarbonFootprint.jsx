import { useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Leaf, ShieldCheck, Scale } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import CountUp from '../components/ui/CountUp'
import { Field, RadioPills, Slider } from '../components/ui/inputs'
import ResultArea from '../components/demo/ResultArea'
import { computeCarbon, vehicleOptions } from '../data/logistics'
import { truncateHash } from '../lib/utils'

export default function CarbonFootprint() {
  const [form, setForm] = useState({ vehicle: 'truck', weightKg: 1200, distance: 120 })
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null)
  const [result, setResult] = useState(null)

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  function calculate() {
    setPending(computeCarbon(form))
    setBusy(true)
  }

  const maxBar = result ? Math.max(result.yours, result.industryAvg) : 1

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          Carbon Footprint
        </h1>
        <p className="mt-1.5 text-sm text-text-dim">
          Per-shipment CO₂e, aligned with GHG Protocol Scope 3 — and cryptographically
          audit-logged.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* form */}
        <Card title="Shipment Inputs" icon={Leaf} className="lg:col-span-2" bodyClassName="space-y-5">
          <Field label="Vehicle type">
            <RadioPills value={form.vehicle} onChange={set('vehicle')} options={vehicleOptions} disabled={busy} />
          </Field>
          <Field label="Load weight" hint="kg">
            <Slider value={form.weightKg} onChange={set('weightKg')} min={0} max={8000} step={50} unit="kg" disabled={busy} />
          </Field>
          <Field label="Distance" hint="km">
            <Slider value={form.distance} onChange={set('distance')} min={4} max={200} step={1} unit="km" disabled={busy} />
          </Field>
          <Button onClick={calculate} disabled={busy} size="lg" className="w-full" icon={Leaf}>
            Calculate
          </Button>
        </Card>

        {/* results */}
        <div className="lg:col-span-3">
          <ResultArea
            busy={busy}
            hasResult={!!result}
            processingLabel="Calculating emissions"
            processingStages={['Emission factors', 'Scope 3 model', 'Hashing to audit log']}
            processingDuration={1000}
            onComplete={() => {
              setResult(pending)
              setBusy(false)
            }}
            idle={
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-border-hi bg-surface-2 text-text-faint">
                  <Leaf className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-mono text-sm text-text-dim">No calculation yet</p>
                <p className="mt-1.5 text-xs text-text-faint">
                  Set load and distance to compute verifiable emissions.
                </p>
              </div>
            }
          >
            {result && (
              <div className="space-y-5">
                <div className="grid items-center gap-4 sm:grid-cols-2">
                  {/* headline + donut */}
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                      Total emissions
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <CountUp
                        value={result.total}
                        decimals={1}
                        className="font-mono text-5xl font-semibold tabular-nums text-text"
                      />
                      <span className="text-lg text-text-dim">kg CO₂e</span>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {result.breakdown.map((b) => (
                        <div key={b.name} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: b.color }} />
                          <span className="text-text-dim">{b.name}</span>
                          <span className="ml-auto font-mono tabular-nums text-text-faint">
                            {b.value.toFixed(1)} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.breakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={80}
                          paddingAngle={2}
                          stroke="none"
                          animationDuration={800}
                        >
                          {result.breakdown.map((b, i) => (
                            <Cell key={i} fill={b.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-xl font-semibold text-text">
                        {result.total.toFixed(1)}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
                        kg CO₂e
                      </span>
                    </div>
                  </div>
                </div>

                {/* vs industry */}
                <div className="rounded-md border border-border bg-surface-2/40 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
                      <span className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                        vs. industry average
                      </span>
                    </div>
                    <Badge variant="success" dot>
                      {result.percentSaved}% lower
                    </Badge>
                  </div>
                  {[
                    { label: 'This shipment', value: result.yours, color: '#10b981' },
                    { label: 'Industry avg', value: result.industryAvg, color: '#64748b' },
                  ].map((row) => (
                    <div key={row.label} className="mb-2 last:mb-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-dim">{row.label}</span>
                        <span className="font-mono tabular-nums text-text-faint">
                          {row.value.toFixed(1)} kg
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(row.value / maxBar) * 100}%`, background: row.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* verifiable */}
                <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/5 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-success/40 bg-success/10 text-success">
                    <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
                      Verifiable ✓
                      <span className="font-mono text-[10px] font-normal text-text-faint">
                        audit-logged
                      </span>
                    </p>
                    <p className="truncate font-mono text-[11px] text-text-dim">
                      sha256:{truncateHash(result.hash, 10, 8)}
                    </p>
                  </div>
                  <span className="ml-auto hidden font-mono text-[10px] text-text-faint sm:block">
                    Trust Layer
                  </span>
                </div>
              </div>
            )}
          </ResultArea>
        </div>
      </div>
    </div>
  )
}
