import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts'
import { Clock, Route as RouteIcon, Lightbulb, TrendingUp } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import CountUp from '../components/ui/CountUp'
import { Field, Select, RadioPills } from '../components/ui/inputs'
import ResultArea from '../components/demo/ResultArea'
import {
  computeDelay,
  distanceKm,
  locationOptions,
  vehicleOptions,
  departureOptions,
  weatherOptions,
} from '../data/logistics'

const LEVEL_BADGE = { LOW: 'success', MODERATE: 'warning', HIGH: 'danger' }
const BAR_FILLS = ['#f59e0b', '#b45309', '#3b82f6', '#8b5cf6', '#64748b']

export default function DelayPrediction() {
  const [form, setForm] = useState({
    origin: 'jakarta',
    destination: 'bandung',
    vehicle: 'van',
    departure: 'evening',
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

  function predict() {
    setPending(computeDelay(form))
    setBusy(true)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
          Delay Prediction
        </h1>
        <p className="mt-1.5 text-sm text-text-dim">
          Estimate delivery delay from route, vehicle, departure window, and weather.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* form */}
        <Card title="Shipment Parameters" icon={RouteIcon} className="lg:col-span-2" bodyClassName="space-y-4">
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

          <Button onClick={predict} disabled={busy} size="lg" className="w-full" icon={Clock}>
            Predict Delay
          </Button>
        </Card>

        {/* results */}
        <div className="lg:col-span-3">
          <ResultArea
            busy={busy}
            hasResult={!!result}
            processingLabel="Running prediction"
            processingStages={['Loading features', 'Traffic & weather model', 'Inference']}
            processingDuration={1000}
            onComplete={() => {
              setResult(pending)
              setBusy(false)
            }}
            idle={
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-border-hi bg-surface-2 text-text-faint">
                  <Clock className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-mono text-sm text-text-dim">No prediction yet</p>
                <p className="mt-1.5 text-xs text-text-faint">
                  Set parameters and run the model to see the expected delay.
                </p>
              </div>
            }
          >
            {result && (
              <div className="space-y-5">
                {/* headline */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                      Predicted delay
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <CountUp
                        value={result.predicted}
                        className="font-mono text-5xl font-semibold tabular-nums text-text"
                      />
                      <span className="text-xl text-text-dim">min</span>
                    </div>
                    <p className="mt-1.5 font-mono text-xs text-text-faint">
                      95% CI: {result.ci[0]}–{result.ci[1]} min · {result.distance} km
                    </p>
                  </div>
                  <Badge variant={LEVEL_BADGE[result.level]} dot className="text-xs">
                    {result.level} RISK
                  </Badge>
                </div>

                {/* feature importance */}
                <div className="rounded-md border border-border bg-surface-2/40 p-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
                    <span className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
                      Feature importance
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={188}>
                    <BarChart
                      data={result.features}
                      layout="vertical"
                      margin={{ top: 0, right: 36, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke="#1f2937" />
                      <XAxis type="number" hide domain={[0, 'dataMax']} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={92}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={16} animationDuration={800}>
                        {result.features.map((_, i) => (
                          <Cell key={i} fill={BAR_FILLS[i % BAR_FILLS.length]} />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="right"
                          formatter={(v) => `${v}%`}
                          style={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* recommendation */}
                <div className="flex gap-3 rounded-md border border-accent/30 bg-accent/5 p-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
                      Recommendation
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-text-dim">
                      {result.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ResultArea>
        </div>
      </div>
    </div>
  )
}
