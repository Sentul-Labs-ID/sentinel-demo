import { useMemo, useState } from 'react'
import { GaugeCircle, ListChecks, AlertTriangle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import { Field, Select, RadioPills } from '../components/ui/inputs'
import ResultArea from '../components/demo/ResultArea'
import RiskGauge from '../components/demo/RiskGauge'
import {
  computeSLA,
  similarShipments,
  distanceKm,
  locationOptions,
  vehicleOptions,
  departureOptions,
  weatherOptions,
} from '../data/logistics'

const LEVEL_BADGE = { LOW: 'success', MEDIUM: 'warning', HIGH: 'danger' }
const FACTOR_COLOR = ['#ef4444', '#f59e0b', '#3b82f6']

const SIMILAR_COLUMNS = [
  { key: 'id', header: 'Shipment', mono: true },
  { key: 'route', header: 'Route' },
  {
    key: 'risk',
    header: 'Risk',
    align: 'right',
    sortable: true,
    render: (r) => (
      <span
        className="font-mono text-xs font-semibold tabular-nums"
        style={{ color: r.risk >= 67 ? '#ef4444' : r.risk >= 34 ? '#f59e0b' : '#10b981' }}
      >
        {r.risk}
      </span>
    ),
  },
  {
    key: 'slip',
    header: 'ETA slip',
    align: 'right',
    mono: true,
    render: (r) => `+${r.slip}m`,
  },
  {
    key: 'level',
    header: 'Class',
    render: (r) => (
      <Badge variant={LEVEL_BADGE[r.level]} dot>
        {r.level}
      </Badge>
    ),
  },
]

export default function SLARisk() {
  const [form, setForm] = useState({
    origin: 'cikarang',
    destination: 'bandung',
    vehicle: 'truck',
    departure: 'morning',
    weather: 'rain',
  })
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null)
  const [result, setResult] = useState(null)

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const distance = useMemo(
    () => distanceKm(form.origin, form.destination),
    [form.origin, form.destination],
  )
  const similar = useMemo(
    () => (result ? similarShipments(form, result.score) : []),
    [result, form],
  )

  function assess() {
    setPending(computeSLA(form))
    setBusy(true)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          SLA Risk Classifier
        </h1>
        <p className="mt-1.5 text-sm text-text-dim">
          Score a shipment’s risk of breaching its delivery SLA before it ships.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* form */}
        <Card title="Shipment Parameters" icon={GaugeCircle} className="lg:col-span-2" bodyClassName="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Origin">
              <Select value={form.origin} onChange={set('origin')} options={locationOptions} disabled={busy} />
            </Field>
            <Field label="Destination">
              <Select value={form.destination} onChange={set('destination')} options={locationOptions} disabled={busy} />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-surface-2/50 px-3 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
              Distance (auto)
            </span>
            <span className="font-mono text-sm font-semibold text-text">{distance} km</span>
          </div>

          <Field label="Vehicle type">
            <RadioPills value={form.vehicle} onChange={set('vehicle')} options={vehicleOptions} disabled={busy} />
          </Field>

          <Field label="Departure window">
            <Select value={form.departure} onChange={set('departure')} options={departureOptions} disabled={busy} />
          </Field>

          <Field label="Weather">
            <Select value={form.weather} onChange={set('weather')} options={weatherOptions} disabled={busy} />
          </Field>

          <Button onClick={assess} disabled={busy} size="lg" className="w-full" icon={GaugeCircle}>
            Assess Risk
          </Button>
        </Card>

        {/* results */}
        <div className="lg:col-span-3">
          <ResultArea
            busy={busy}
            hasResult={!!result}
            processingLabel="Assessing SLA risk"
            processingStages={['Feature extraction', 'Risk classifier', 'Peer comparison']}
            processingDuration={1000}
            onComplete={() => {
              setResult(pending)
              setBusy(false)
            }}
            idle={
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-border-hi bg-surface-2 text-text-faint">
                  <GaugeCircle className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-mono text-sm text-text-dim">No assessment yet</p>
                <p className="mt-1.5 text-xs text-text-faint">
                  Run the classifier to see the SLA breach risk score.
                </p>
              </div>
            }
          >
            {result && (
              <div className="space-y-5">
                <div className="grid items-center gap-4 sm:grid-cols-2">
                  <RiskGauge value={result.score} level={result.level} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                      Classification
                    </p>
                    <Badge variant={LEVEL_BADGE[result.level]} dot className="mt-1.5 text-sm">
                      {result.level} RISK
                    </Badge>
                    <div className="mt-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <ListChecks className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
                        <span className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                          Top risk factors
                        </span>
                      </div>
                      <div className="space-y-2">
                        {result.factors.map((f, i) => (
                          <div key={f.label}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-dim">{f.label}</span>
                              <span className="font-mono tabular-nums text-text-faint">{f.pct}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${f.pct}%`, background: FACTOR_COLOR[i] }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* similar shipments */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
                    <span className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                      Similar at-risk shipments
                    </span>
                  </div>
                  <DataTable
                    columns={SIMILAR_COLUMNS}
                    rows={similar}
                    rowKey={(r) => r.id}
                    severity={(r) =>
                      r.level === 'HIGH' ? 'danger' : r.level === 'MEDIUM' ? 'warning' : undefined
                    }
                  />
                </div>
              </div>
            )}
          </ResultArea>
        </div>
      </div>
    </div>
  )
}
