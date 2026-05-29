import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { deliveryPerformance, carbonTrend, carbonBaseline } from '../../data/metrics'

const AXIS = {
  tick: { fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  axisLine: { stroke: '#1f2937' },
  tickLine: false,
}

function ChartTooltip({ active, payload, label, unit = '', formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border-hi bg-surface-2 px-3 py-2 shadow-xl">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-text-faint">
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 font-mono text-xs text-text">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="capitalize text-text-dim">{p.name}</span>
          <span className="ml-auto font-semibold tabular-nums">
            {formatter ? formatter(p.value) : p.value}
            {unit}
          </span>
        </p>
      ))}
    </div>
  )
}

export function DeliveryPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={deliveryPerformance} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barGap={3}>
        <CartesianGrid stroke="#1f2937" vertical={false} />
        <XAxis dataKey="day" {...AXIS} />
        <YAxis {...AXIS} width={48} />
        <Tooltip
          cursor={{ fill: 'rgba(148,163,184,0.06)' }}
          content={<ChartTooltip formatter={(v) => v.toLocaleString('en-US')} />}
        />
        <Bar dataKey="onTime" name="On-time" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={22} animationDuration={900} />
        <Bar dataKey="late" name="Late" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={22} animationDuration={900} animationBegin={150} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CarbonTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={carbonTrend} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="carbonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1f2937" vertical={false} />
        <XAxis dataKey="day" {...AXIS} />
        <YAxis {...AXIS} width={48} domain={[6, 13]} />
        <Tooltip content={<ChartTooltip unit="t" formatter={(v) => v.toFixed(1)} />} />
        <ReferenceLine
          y={carbonBaseline}
          stroke="#f97316"
          strokeDasharray="4 4"
          strokeOpacity={0.6}
          label={{
            value: 'Industry baseline',
            position: 'insideTopRight',
            fill: '#f97316',
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        />
        <Area
          type="monotone"
          dataKey="co2"
          name="CO2e"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#carbonFill)"
          animationDuration={1000}
          dot={{ r: 2.5, fill: '#10b981', strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#10b981', stroke: '#0a0e14', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
