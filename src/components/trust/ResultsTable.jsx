import { useMemo, useState } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import { trustColor, STATUS_BADGE } from '../../data/mockResults'
import { truncateHash, cn } from '../../lib/utils'
import { AlertTriangle } from 'lucide-react'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'suspect', label: 'Suspect' },
  { key: 'valid', label: 'Valid' },
]

function TrustBar({ score }) {
  const color = trustColor(score)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full" style={{ width: `${score * 100}%`, background: color }} />
      </div>
      <span className="font-mono text-xs tabular-nums" style={{ color }}>
        {score.toFixed(2)}
      </span>
    </div>
  )
}

const COLUMNS = [
  { key: 'id', header: 'Record ID', mono: true, sortable: true },
  {
    key: 'trustScore',
    header: 'Trust Score',
    sortable: true,
    render: (r) => <TrustBar score={r.trustScore} />,
  },
  {
    key: 'violations',
    header: 'Violations',
    render: (r) =>
      r.violations.length === 0 ? (
        <span className="text-text-faint">—</span>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="max-w-[160px] truncate text-xs text-text-dim">
            {r.violations[0]}
          </span>
          {r.violations.length > 1 && (
            <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-text-faint">
              +{r.violations.length - 1}
            </span>
          )}
        </div>
      ),
  },
  {
    key: 'anomalyScore',
    header: 'Anomaly',
    align: 'right',
    sortable: true,
    render: (r) => (
      <span
        className="font-mono text-xs tabular-nums"
        style={{ color: r.anomalyScore >= 0.7 ? '#ef4444' : r.anomalyScore >= 0.38 ? '#f97316' : '#64748b' }}
      >
        {r.anomalyScore.toFixed(2)}
      </span>
    ),
  },
  {
    key: 'hash',
    header: 'Audit Hash',
    render: (r) => (
      <span className="inline-flex items-center gap-1.5">
        <span className="font-mono text-xs text-text-dim">{truncateHash(r.hash, 4, 4)}</span>
        {r.tampered && (
          <AlertTriangle className="h-3.5 w-3.5 text-danger" strokeWidth={2.5} />
        )}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <Badge variant={STATUS_BADGE[r.status]} dot>
        {r.status}
      </Badge>
    ),
  },
]

export default function ResultsTable({ dataset }) {
  const [filter, setFilter] = useState('all')

  const counts = useMemo(() => {
    const c = { all: dataset.records.length, critical: 0, suspect: 0, valid: 0 }
    for (const r of dataset.records) c[r.status]++
    return c
  }, [dataset])

  const rows = useMemo(
    () => (filter === 'all' ? dataset.records : dataset.records.filter((r) => r.status === filter)),
    [dataset, filter],
  )

  return (
    <Card
      title="Validation Results"
      subtitle={`Sample of ${dataset.records.length} records · sorted by severity`}
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors',
                  active
                    ? f.key === 'critical'
                      ? 'border-danger/40 bg-danger/10 text-danger'
                      : f.key === 'suspect'
                        ? 'border-warning/40 bg-warning/10 text-warning'
                        : f.key === 'valid'
                          ? 'border-success/40 bg-success/10 text-success'
                          : 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border text-text-dim hover:border-border-hi hover:text-text',
                )}
              >
                {f.label}
                <span className="ml-1.5 opacity-70">{counts[f.key]}</span>
              </button>
            )
          })}
        </div>
      }
      bodyClassName="p-0"
    >
      <DataTable
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => r.id}
        severity={(r) =>
          r.status === 'critical' ? 'danger' : r.status === 'suspect' ? 'warning' : undefined
        }
        emptyLabel="No records match this filter"
        className="rounded-none border-0"
      />
    </Card>
  )
}
