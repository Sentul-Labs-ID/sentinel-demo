import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Dark-themed data table with optional sortable headers and per-row severity coloring.
 *
 * columns: [{ key, header, align?, sortable?, mono?, render?(row) }]
 * rows:    array of objects
 * severity?(row) -> 'danger' | 'warning' | 'success' | 'info' | undefined
 *                   tints the row's left edge + subtle background
 */
const SEVERITY_ROW = {
  danger: 'before:bg-danger/70 hover:bg-danger/5',
  warning: 'before:bg-warning/70 hover:bg-warning/5',
  success: 'before:bg-success/70 hover:bg-success/5',
  info: 'before:bg-info/70 hover:bg-info/5',
  accent: 'before:bg-accent/70 hover:bg-accent/5',
}

export default function DataTable({
  columns,
  rows,
  severity,
  onRowClick,
  rowKey = (_, i) => i,
  emptyLabel = 'No records',
  className,
}) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const sorted = useMemo(() => {
    if (!sort.key) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av
      }
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return copy
  }, [rows, sort, columns])

  function toggleSort(key) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-md border border-border scrollbar-thin',
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2">
            {columns.map((col) => {
              const active = sort.key === col.key
              const SortIcon = !active
                ? ChevronsUpDown
                : sort.dir === 'asc'
                  ? ChevronUp
                  : ChevronDown
              return (
                <th
                  key={col.key}
                  className={cn(
                    'whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-faint',
                    col.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1 transition-colors hover:text-text',
                        active && 'text-text',
                        col.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {col.header}
                      <SortIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3.5 py-10 text-center text-sm text-text-faint"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
          {sorted.map((row, i) => {
            const sev = severity?.(row)
            return (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'relative border-b border-border/60 transition-colors last:border-0',
                  'before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:content-[""]',
                  sev ? SEVERITY_ROW[sev] : 'hover:bg-surface-2',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'whitespace-nowrap px-3.5 py-2.5 text-text-dim',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      col.mono && 'font-mono tabular-nums text-text',
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
