/**
 * Jabodetabek + Bandung logistics network.
 * Coordinates are stylized (viewBox 0–100 x 0–66), arranged to echo the real
 * relative geography without claiming map accuracy — cleaner and intentional.
 *
 * status: 'healthy' | 'busy' | 'warning'
 */
export const hubs = [
  { id: 'tangerang', name: 'Tangerang', x: 13, y: 26, status: 'healthy', inTransit: 142 },
  { id: 'jakarta', name: 'Jakarta', x: 37, y: 18, status: 'busy', inTransit: 318, primary: true },
  { id: 'bekasi', name: 'Bekasi', x: 54, y: 22, status: 'healthy', inTransit: 176 },
  { id: 'depok', name: 'Depok', x: 39, y: 38, status: 'healthy', inTransit: 98 },
  { id: 'bogor', name: 'Bogor', x: 44, y: 55, status: 'healthy', inTransit: 74 },
  { id: 'cikarang', name: 'Cikarang', x: 67, y: 27, status: 'busy', inTransit: 254 },
  { id: 'karawang', name: 'Karawang', x: 80, y: 33, status: 'warning', inTransit: 121 },
  { id: 'bandung', name: 'Bandung', x: 89, y: 57, status: 'healthy', inTransit: 203 },
]

/** Directed-ish links between hubs that carry shipment flow. */
export const routes = [
  { from: 'tangerang', to: 'jakarta', load: 'high' },
  { from: 'jakarta', to: 'bekasi', load: 'high' },
  { from: 'jakarta', to: 'depok', load: 'med' },
  { from: 'depok', to: 'bogor', load: 'low' },
  { from: 'bekasi', to: 'cikarang', load: 'high' },
  { from: 'cikarang', to: 'karawang', load: 'med' },
  { from: 'karawang', to: 'bandung', load: 'med' },
  { from: 'bekasi', to: 'depok', load: 'low' },
  { from: 'cikarang', to: 'bandung', load: 'high' },
  { from: 'bogor', to: 'bandung', load: 'low' },
]

export const hubById = Object.fromEntries(hubs.map((h) => [h.id, h]))

/** Tailwind class + hex per status, used by the live map. */
export const STATUS_STYLE = {
  healthy: { dot: 'fill-success', ring: 'stroke-success', hex: '#10b981' },
  busy: { dot: 'fill-accent', ring: 'stroke-accent', hex: '#f59e0b' },
  warning: { dot: 'fill-warning', ring: 'stroke-warning', hex: '#f97316' },
}

/* ===================================================================== *
 *  CASCADE SIMULATOR — dependency network
 * ===================================================================== */

/** ~24 nodes across 3 tiers. capacity drives node size; tier 1 = gateways. */
export const networkNodes = [
  // tier 1 — primary gateways
  { id: 'jakarta', name: 'Jakarta Central', tier: 1, capacity: 100, health: 'healthy' },
  { id: 'cikarang', name: 'Cikarang Megahub', tier: 1, capacity: 96, health: 'busy' },
  { id: 'bekasi', name: 'Bekasi Hub', tier: 1, capacity: 84, health: 'healthy' },
  { id: 'bandung', name: 'Bandung Hub', tier: 1, capacity: 80, health: 'healthy' },
  // tier 2 — regional sort centres
  { id: 'tangerang', name: 'Tangerang', tier: 2, capacity: 70, health: 'healthy' },
  { id: 'depok', name: 'Depok', tier: 2, capacity: 64, health: 'healthy' },
  { id: 'cawang', name: 'Cawang', tier: 2, capacity: 60, health: 'healthy' },
  { id: 'karawang', name: 'Karawang', tier: 2, capacity: 66, health: 'warning' },
  { id: 'cikampek', name: 'Cikampek', tier: 2, capacity: 62, health: 'healthy' },
  { id: 'cibitung', name: 'Cibitung', tier: 2, capacity: 58, health: 'healthy' },
  { id: 'bogor', name: 'Bogor', tier: 2, capacity: 56, health: 'healthy' },
  { id: 'cileungsi', name: 'Cileungsi', tier: 2, capacity: 52, health: 'healthy' },
  { id: 'padalarang', name: 'Padalarang', tier: 2, capacity: 50, health: 'healthy' },
  { id: 'cimahi', name: 'Cimahi', tier: 2, capacity: 48, health: 'healthy' },
  // tier 3 — last-mile spokes
  { id: 'serpong', name: 'Serpong', tier: 3, capacity: 40, health: 'healthy' },
  { id: 'bsd', name: 'BSD', tier: 3, capacity: 42, health: 'healthy' },
  { id: 'cinere', name: 'Cinere', tier: 3, capacity: 34, health: 'healthy' },
  { id: 'sawangan', name: 'Sawangan', tier: 3, capacity: 32, health: 'healthy' },
  { id: 'cibinong', name: 'Cibinong', tier: 3, capacity: 38, health: 'healthy' },
  { id: 'jababeka', name: 'Jababeka', tier: 3, capacity: 44, health: 'healthy' },
  { id: 'deltamas', name: 'Deltamas', tier: 3, capacity: 41, health: 'healthy' },
  { id: 'purwakarta', name: 'Purwakarta', tier: 3, capacity: 36, health: 'healthy' },
  { id: 'lippo', name: 'Lippo Cikarang', tier: 3, capacity: 39, health: 'healthy' },
  { id: 'bekasiutara', name: 'Bekasi Utara', tier: 3, capacity: 37, health: 'healthy' },
]

/** Directed flow edges: source (upstream) feeds target (downstream dependent). */
export const networkEdges = [
  ['jakarta', 'tangerang'], ['jakarta', 'depok'], ['jakarta', 'cawang'], ['jakarta', 'bogor'],
  ['cikarang', 'karawang'], ['cikarang', 'cikampek'], ['cikarang', 'cibitung'], ['cikarang', 'bekasi'],
  ['bekasi', 'cibitung'], ['bekasi', 'cileungsi'],
  ['bandung', 'padalarang'], ['bandung', 'cimahi'], ['bandung', 'cikampek'],
  ['tangerang', 'serpong'], ['tangerang', 'bsd'],
  ['depok', 'cinere'], ['depok', 'sawangan'],
  ['bogor', 'cibinong'],
  ['cikampek', 'jababeka'], ['cikampek', 'deltamas'],
  ['karawang', 'purwakarta'],
  ['cibitung', 'lippo'],
  ['cileungsi', 'bekasiutara'],
  ['cawang', 'cinere'],
].map(([source, target]) => ({ source, target }))

export const SCENARIOS = [
  {
    id: 'cikarang',
    label: 'Cikarang Hub Capacity Loss',
    failHub: 'cikarang',
    base: { affected: 1247, breaches: 312, revenue: 487, ttfcMin: 263 },
    mitigations: [
      { id: 'm1', label: 'Reroute via Cibitung overflow hub', reduction: 28 },
      { id: 'm2', label: 'Activate Karawang backup capacity', reduction: 22 },
      { id: 'm3', label: 'Pre-position inventory at Bekasi', reduction: 16 },
    ],
  },
  {
    id: 'cikampek',
    label: 'Cikampek Toll Closure',
    failHub: 'cikampek',
    base: { affected: 864, breaches: 198, revenue: 311, ttfcMin: 174 },
    mitigations: [
      { id: 'm1', label: 'Divert to Pantura arterial route', reduction: 26 },
      { id: 'm2', label: 'Night-window dispatch to beat closure', reduction: 19 },
      { id: 'm3', label: 'Shift COD volume to pickup lockers', reduction: 13 },
    ],
  },
  {
    id: 'bandung',
    label: 'Bandung Power Outage',
    failHub: 'bandung',
    base: { affected: 1032, breaches: 241, revenue: 398, ttfcMin: 142 },
    mitigations: [
      { id: 'm1', label: 'Switch to genset-backed sort line', reduction: 31 },
      { id: 'm2', label: 'Reroute inbound to Padalarang', reduction: 20 },
      { id: 'm3', label: 'Throttle non-urgent SLA tiers', reduction: 11 },
    ],
  },
]
export const scenarioById = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]))

export const HORIZONS = [
  { id: '6h', label: 'Next 6 hours' },
  { id: '12h', label: 'Next 12 hours' },
  { id: '24h', label: 'Next 24 hours' },
]

/**
 * Propagate a failure downstream from the scenario's hub.
 * severity (0–100) controls how deep the cascade reaches (1–3 layers).
 * Returns failTimes (ms offsets for the animation), reached set, depth, and
 * severity-scaled impact metrics.
 */
export function computeCascade({ scenario, severity, peak }) {
  const sc = scenarioById[scenario]
  const adj = {}
  for (const { source, target } of networkEdges) {
    ;(adj[source] = adj[source] || []).push(target)
  }
  const maxDepth = severity < 34 ? 1 : severity < 67 ? 2 : 3

  // BFS layers from the failed hub
  const layer = { [sc.failHub]: 0 }
  const queue = [sc.failHub]
  while (queue.length) {
    const cur = queue.shift()
    if (layer[cur] >= maxDepth) continue
    for (const nxt of adj[cur] || []) {
      if (layer[nxt] === undefined) {
        layer[nxt] = layer[cur] + 1
        queue.push(nxt)
      }
    }
  }

  const TOTAL_MS = 3000
  const step = TOTAL_MS / (maxDepth + 1)
  const failTimes = {}
  let i = 0
  for (const [id, lyr] of Object.entries(layer)) {
    failTimes[id] = lyr * step + (lyr === 0 ? 0 : (i % 4) * 90)
    i++
  }

  const reached = Object.keys(layer)
  const depthLayers = Math.max(...Object.values(layer)) // 0..3
  const sevFactor = (severity / 70) * (peak ? 1.18 : 1)

  const metrics = {
    affected: Math.round(sc.base.affected * sevFactor),
    breaches: Math.round(sc.base.breaches * sevFactor),
    revenue: Math.round(sc.base.revenue * sevFactor),
    depth: Math.min(3, depthLayers + (depthLayers > 0 ? 0 : 0)) || depthLayers,
    ttfcMin: Math.max(45, Math.round(sc.base.ttfcMin * (70 / severity) / (peak ? 1.15 : 1))),
  }

  return { failHub: sc.failHub, failTimes, reached, depth: depthLayers, metrics, mitigations: sc.mitigations, totalMs: TOTAL_MS }
}

/** Format minutes as "4h 23min". */
export function formatHM(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}
