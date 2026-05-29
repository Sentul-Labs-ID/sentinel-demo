/**
 * Fraud Detection — mock analysis output.
 * Static + deterministic so the "Scan" always reveals the same findings.
 */

export const TOTAL_SCANNED = 8432

/** Fraud-probability histogram (10 bins, 0.0–1.0). Most traffic is clean. */
export const fraudDistribution = [
  { bucket: '0.0', count: 5210 },
  { bucket: '0.1', count: 1740 },
  { bucket: '0.2', count: 712 },
  { bucket: '0.3', count: 358 },
  { bucket: '0.4', count: 169 },
  { bucket: '0.5', count: 113 },
  { bucket: '0.6', count: 64 },
  { bucket: '0.7', count: 41 },
  { bucket: '0.8', count: 28 },
  { bucket: '0.9', count: 14 },
].map((b) => ({
  ...b,
  fill: Number(b.bucket) >= 0.7 ? '#ef4444' : Number(b.bucket) >= 0.5 ? '#f97316' : '#3b82f6',
}))

export const FRAUD_TYPE = {
  spoof: { label: 'GPS Spoof', color: 'danger' },
  ghost: { label: 'Ghost Delivery', color: 'warning' },
  syndicate: { label: 'COD Syndicate', color: 'violet' },
}

/** Flagged shipments surfaced by the scan. */
export const flaggedShipments = [
  {
    id: 'BLI-2026-JKT-001247',
    probability: 0.96,
    type: 'spoof',
    reason: 'GPS coordinates jumped 11.8 km in 38 s',
    detail:
      'Reported position teleported from Cikarang to Bekasi between two consecutive pings — a physically impossible velocity of 1,118 km/h. The “delivered” event was raised from the spoofed location.',
    evidence: ['Velocity 1,118 km/h', 'Ping gap 38 s', 'No cell-tower handover'],
  },
  {
    id: 'BLI-2026-BKS-001559',
    probability: 0.93,
    type: 'syndicate',
    reason: 'COD account linked to 3 flagged numbers',
    detail:
      'Account shares device fingerprint and payout IP with three previously charged-back COD accounts. Part of a 12-node cluster operating in the same kelurahan.',
    evidence: ['Shared device ID', 'Shared payout IP', 'Same drop address ×4'],
  },
  {
    id: 'BLI-2026-TNG-001934',
    probability: 0.89,
    type: 'ghost',
    reason: 'Odometer inconsistent with route distance',
    detail:
      'Vehicle logged 4 km of travel for a route measured at 27 km. Proof-of-delivery photo hash matches an upload from a different shipment two days earlier.',
    evidence: ['Odometer 4 km vs 27 km', 'Duplicate POD photo hash', 'Dwell 0 s'],
  },
  {
    id: 'BLI-2026-KRW-002034',
    probability: 0.81,
    type: 'syndicate',
    reason: 'Burst of COD orders to one drop point',
    detail:
      '9 high-value COD orders routed to a single address within 26 minutes, all from accounts created in the last 72 hours.',
    evidence: ['9 orders / 26 min', 'Accounts < 72 h old', 'Same drop point'],
  },
  {
    id: 'BLI-2026-DPK-001903',
    probability: 0.74,
    type: 'ghost',
    reason: 'Delivered before arriving at hub',
    detail:
      'Delivery confirmation timestamp precedes the package’s last hub scan, implying the status was set manually.',
    evidence: ['Delivered < last scan', 'No recipient signature', 'Manual status set'],
  },
  {
    id: 'BLI-2026-JKT-002255',
    probability: 0.68,
    type: 'spoof',
    reason: 'Location accuracy radius implausibly low indoors',
    detail:
      'Reported GPS accuracy of 1 m sustained inside a multi-storey building — consistent with a mock-location app rather than a real fix.',
    evidence: ['1 m accuracy indoors', 'No drift', 'Mock-location signature'],
  },
  {
    id: 'BLI-2026-BGR-002098',
    probability: 0.62,
    type: 'syndicate',
    reason: 'Shared bank account across accounts',
    detail:
      'Refund payout account matches two other COD accounts with elevated chargeback rates.',
    evidence: ['Shared payout account', 'Chargeback rate 38%', 'Same area code'],
  },
  {
    id: 'BLI-2026-BDG-002210',
    probability: 0.55,
    type: 'ghost',
    reason: 'Repeated failed-then-success pattern',
    detail:
      'Five consecutive “failed delivery” events followed by an instant success with no location change — a known padding pattern.',
    evidence: ['5 fails → instant success', 'No geo change', 'Attempt interval 11 s'],
  },
]

/**
 * COD syndicate cluster — accounts (nodes) joined by shared attributes (links).
 * Intentionally dense around a few hubs to look suspicious.
 */
const ACCOUNTS = [
  'ACC-4471', 'ACC-4490', 'ACC-4512', 'ACC-4528', 'ACC-4536', 'ACC-4559',
  'ACC-4573', 'ACC-4588', 'ACC-4601', 'ACC-4619', 'ACC-4634', 'ACC-4650',
]
export const syndicateGraph = {
  nodes: ACCOUNTS.map((id, i) => ({
    id,
    // three ringleaders are the densest / most flagged
    ringleader: i === 0 || i === 4 || i === 8,
    val: i === 0 || i === 4 || i === 8 ? 8 : 4,
  })),
  links: [
    { source: 'ACC-4471', target: 'ACC-4490', attr: 'same IP' },
    { source: 'ACC-4471', target: 'ACC-4512', attr: 'same device' },
    { source: 'ACC-4471', target: 'ACC-4528', attr: 'same area' },
    { source: 'ACC-4490', target: 'ACC-4512', attr: 'same area' },
    { source: 'ACC-4490', target: 'ACC-4536', attr: 'same IP' },
    { source: 'ACC-4536', target: 'ACC-4559', attr: 'same device' },
    { source: 'ACC-4536', target: 'ACC-4573', attr: 'same area' },
    { source: 'ACC-4559', target: 'ACC-4573', attr: 'same IP' },
    { source: 'ACC-4528', target: 'ACC-4559', attr: 'same bank' },
    { source: 'ACC-4601', target: 'ACC-4619', attr: 'same device' },
    { source: 'ACC-4601', target: 'ACC-4634', attr: 'same area' },
    { source: 'ACC-4619', target: 'ACC-4650', attr: 'same IP' },
    { source: 'ACC-4634', target: 'ACC-4650', attr: 'same bank' },
    { source: 'ACC-4588', target: 'ACC-4601', attr: 'same area' },
    { source: 'ACC-4573', target: 'ACC-4588', attr: 'same device' },
    { source: 'ACC-4512', target: 'ACC-4634', attr: 'same IP' },
  ],
}

export const fraudSummary = {
  scanned: TOTAL_SCANNED,
  flagged: flaggedShipments.length + 15, // table shows a sample
  highRisk: flaggedShipments.filter((f) => f.probability >= 0.8).length + 4,
  syndicates: 2,
}
