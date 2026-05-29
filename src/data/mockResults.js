/**
 * Trust & Resilience Layer — mock validation results.
 *
 * Everything is generated deterministically from a per-dataset seed, so the
 * demo is fully repeatable: the same dataset always yields the same records,
 * hashes, and the same "tampered" record for the audit verification demo.
 */
import { shipmentId } from './shipments'

/* ---- deterministic RNG (mulberry32) --------------------------------- */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hex(rng, len) {
  const c = '0123456789abcdef'
  let s = ''
  for (let i = 0; i < len; i++) s += c[Math.floor(rng() * 16)]
  return s
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

/* ---- vocab ----------------------------------------------------------- */
const VIOLATIONS = [
  'Velocity 147 km/h > limit',
  'GPS jump 11.8 km / 38 s',
  'Schema: missing `temp_c`',
  'Source signature mismatch',
  'Emissions +18% vs baseline',
  'Timestamp out of order',
  'Odometer vs route mismatch',
  'Duplicate proof-of-delivery',
]
const REGIONS = ['JKT', 'BKS', 'TNG', 'DPK', 'BGR', 'KRW', 'BDG']
const STATUS_ORDER = { critical: 0, suspect: 1, valid: 2 }

/* ---- dataset definitions -------------------------------------------- */
const META = [
  {
    id: 'jakarta',
    name: 'Jakarta Peak Hours',
    fileName: 'jakarta_peak_2026-05-29.parquet',
    seed: 1337,
    summary: { total: 8432, valid: 8287, suspect: 133, critical: 12 },
    weights: { critical: 0.14, suspect: 0.27 },
  },
  {
    id: 'fraud',
    name: 'Suspected Fraud Set',
    fileName: 'cod_review_batch_0427.parquet',
    seed: 7,
    summary: { total: 3120, valid: 2611, suspect: 402, critical: 107 },
    weights: { critical: 0.34, suspect: 0.33 },
  },
  {
    id: 'clean',
    name: 'Clean Baseline',
    fileName: 'verified_baseline_q1.parquet',
    seed: 99,
    summary: { total: 5040, valid: 5021, suspect: 19, critical: 0 },
    weights: { critical: 0.0, suspect: 0.08 },
  },
]

function buildRecord(rng, meta) {
  const r = rng()
  let status
  if (r < meta.weights.critical) status = 'critical'
  else if (r < meta.weights.critical + meta.weights.suspect) status = 'suspect'
  else status = 'valid'

  const trustScore =
    status === 'valid'
      ? 0.85 + rng() * 0.14
      : status === 'suspect'
        ? 0.55 + rng() * 0.22
        : 0.12 + rng() * 0.33
  const anomalyScore =
    status === 'valid'
      ? 0.02 + rng() * 0.16
      : status === 'suspect'
        ? 0.38 + rng() * 0.32
        : 0.74 + rng() * 0.24

  let violations = []
  if (status === 'suspect') {
    violations = [pick(rng, VIOLATIONS)]
    if (rng() > 0.5) violations.push(pick(rng, VIOLATIONS))
  } else if (status === 'critical') {
    violations = [pick(rng, VIOLATIONS), pick(rng, VIOLATIONS)]
    if (rng() > 0.4) violations.push(pick(rng, VIOLATIONS))
  }
  violations = [...new Set(violations)]

  return {
    id: shipmentId(1000 + Math.floor(rng() * 8999), pick(rng, REGIONS)),
    status,
    trustScore: +trustScore.toFixed(2),
    anomalyScore: +anomalyScore.toFixed(2),
    violations,
    hash: hex(rng, 64),
    tampered: false,
  }
}

function spark(rng, n, base, amp, drift) {
  const out = []
  let v = base
  for (let i = 0; i < n; i++) {
    v = Math.max(0, v + drift + (rng() - 0.5) * amp)
    out.push(+v.toFixed(1))
  }
  return out
}

function buildDataset(meta) {
  // dedicated rng for headline hashes so record generation stays stable
  const metaRng = mulberry32(meta.seed * 7 + 1)
  const merkleRoot = hex(metaRng, 64)

  const rng = mulberry32(meta.seed)
  let records = Array.from({ length: 15 }, () => buildRecord(rng, meta))
  records.sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.anomalyScore - a.anomalyScore,
  )

  // Flag the most severe record as tampered for the audit demo (clean set has none).
  const victim = records.find((r) => r.status === 'critical')
  if (victim) victim.tampered = true

  const sRng = mulberry32(meta.seed + 500)
  const counters = [
    { key: 'total', label: 'Total', value: meta.summary.total, color: '#94a3b8', spark: spark(sRng, 9, 7800, 600, 70) },
    { key: 'valid', label: 'Valid', value: meta.summary.valid, color: '#10b981', spark: spark(sRng, 9, 7600, 500, 80) },
    { key: 'suspect', label: 'Suspect', value: meta.summary.suspect, color: '#f97316', spark: spark(sRng, 9, 160, 60, -4) },
    { key: 'critical', label: 'Critical', value: meta.summary.critical, color: '#ef4444', spark: spark(sRng, 9, 18, 12, -1) },
  ]

  return { ...meta, merkleRoot, records, counters }
}

export const datasets = META.map(buildDataset)
export const datasetById = Object.fromEntries(datasets.map((d) => [d.id, d]))

/** Threshold → color, shared by trust-score bars across the screen. */
export function trustColor(score) {
  if (score >= 0.8) return '#10b981'
  if (score >= 0.5) return '#f97316'
  return '#ef4444'
}

export const STATUS_BADGE = {
  valid: 'success',
  suspect: 'warning',
  critical: 'danger',
}
