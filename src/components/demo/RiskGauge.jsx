import { useCountUp } from '../../lib/useCountUp'

const LEVEL_COLOR = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

/**
 * Semicircular risk gauge (0–100) with an animated, gradient-filled arc.
 * Pure SVG; the arc fills via an animated strokeDashoffset.
 */
export default function RiskGauge({ value, level }) {
  const v = useCountUp(value, 1.3)
  const R = 90
  const len = Math.PI * R
  const offset = len * (1 - Math.min(Math.max(v, 0), 100) / 100)
  const color = LEVEL_COLOR[level] ?? '#f59e0b'

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 128" className="w-full max-w-[300px]">
        <defs>
          <linearGradient id="gaugeGrad" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="200" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* track */}
        <path
          d="M20 110 A90 90 0 0 1 200 110"
          fill="none"
          stroke="#1f2937"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* value arc */}
        <path
          d="M20 110 A90 90 0 0 1 200 110"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={offset}
        />

        {/* center readout */}
        <text x="110" y="96" textAnchor="middle" className="font-mono" style={{ fontSize: 38, fontWeight: 700, fill: color }}>
          {Math.round(v)}
        </text>
        <text x="110" y="116" textAnchor="middle" className="font-mono" style={{ fontSize: 11, fill: '#64748b', letterSpacing: '0.1em' }}>
          RISK SCORE
        </text>

        {/* end labels */}
        <text x="18" y="124" textAnchor="middle" className="font-mono" style={{ fontSize: 9, fill: '#64748b' }}>0</text>
        <text x="202" y="124" textAnchor="middle" className="font-mono" style={{ fontSize: 9, fill: '#64748b' }}>100</text>
      </svg>
    </div>
  )
}
