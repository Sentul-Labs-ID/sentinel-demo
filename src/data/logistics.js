/**
 * Shared logistics constants + deterministic mock "inference" used by the
 * Delay Prediction, SLA Risk, and Carbon Footprint screens.
 *
 * Everything is pure and deterministic: the same inputs always produce the
 * same outputs, so live demos are repeatable. The numbers are tuned to feel
 * responsive (rain + peak hour ⇒ more delay, heavier truck ⇒ more CO₂e).
 */
import { seededHex } from '../lib/utils'

/* ---- locations (approx km offsets from Jakarta, x=E/W, y=N/S) -------- */
export const LOCATIONS = [
  { id: 'jakarta', name: 'Jakarta', km: { x: 0, y: 0 } },
  { id: 'tangerang', name: 'Tangerang', km: { x: -25, y: 1 } },
  { id: 'bekasi', name: 'Bekasi', km: { x: 22, y: 2 } },
  { id: 'depok', name: 'Depok', km: { x: -2, y: -24 } },
  { id: 'bogor', name: 'Bogor', km: { x: 5, y: -54 } },
  { id: 'cikarang', name: 'Cikarang', km: { x: 40, y: 3 } },
  { id: 'karawang', name: 'Karawang', km: { x: 62, y: 5 } },
  { id: 'bandung', name: 'Bandung', km: { x: 110, y: -52 } },
]
export const locById = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]))
export const locationOptions = LOCATIONS.map((l) => ({ value: l.id, label: l.name }))

/** Great-ish-circle distance in km between two hub ids (min 4km). */
export function distanceKm(aId, bId) {
  const a = locById[aId]
  const b = locById[bId]
  if (!a || !b || aId === bId) return aId === bId ? 0 : 8
  const dx = a.km.x - b.km.x
  const dy = a.km.y - b.km.y
  return Math.max(4, Math.round(Math.sqrt(dx * dx + dy * dy)))
}

/* ---- vehicles -------------------------------------------------------- */
export const VEHICLES = [
  { id: 'motor', label: 'Motorcycle', citySpeed: 32, co2PerKm: 0.085, loadFactor: 0.02, dwell: 4, maxLoad: 50 },
  { id: 'van', label: 'Van', citySpeed: 28, co2PerKm: 0.24, loadFactor: 0.06, dwell: 8, maxLoad: 1200 },
  { id: 'truck', label: 'Truck', citySpeed: 24, co2PerKm: 0.82, loadFactor: 0.11, dwell: 14, maxLoad: 8000 },
]
export const vehicleById = Object.fromEntries(VEHICLES.map((v) => [v.id, v]))
export const vehicleOptions = VEHICLES.map((v) => ({ value: v.id, label: v.label }))

/* ---- conditions ------------------------------------------------------ */
export const WEATHER = [
  { id: 'clear', label: 'Clear', mult: 1.0 },
  { id: 'cloudy', label: 'Cloudy', mult: 1.06 },
  { id: 'rain', label: 'Rain', mult: 1.3 },
  { id: 'storm', label: 'Heavy Storm', mult: 1.62 },
]
export const weatherById = Object.fromEntries(WEATHER.map((w) => [w.id, w]))
export const weatherOptions = WEATHER.map((w) => ({ value: w.id, label: w.label }))

export const DEPARTURE = [
  { id: 'offpeak', label: 'Off-peak · 10:00', mult: 1.0 },
  { id: 'morning', label: 'Morning peak · 08:00', mult: 1.45 },
  { id: 'evening', label: 'Evening peak · 18:00', mult: 1.6 },
  { id: 'night', label: 'Night · 23:00', mult: 0.85 },
]
export const departureById = Object.fromEntries(DEPARTURE.map((d) => [d.id, d]))
export const departureOptions = DEPARTURE.map((d) => ({ value: d.id, label: d.label }))

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi)

/* ---- mulberry32 for deterministic table generation ------------------ */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function seedFromInputs(obj) {
  const str = JSON.stringify(obj)
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/* ===================================================================== *
 *  DELAY PREDICTION
 * ===================================================================== */
export function computeDelay({ origin, destination, vehicle, departure, weather }) {
  const v = vehicleById[vehicle]
  const dep = departureById[departure]
  const wx = weatherById[weather]
  const dist = distanceKm(origin, destination)

  const freeFlowMin = (dist / v.citySpeed) * 60
  const congestion = (dep.mult * wx.mult - 1) * freeFlowMin
  const dwell = v.dwell + (dep.mult > 1.4 ? 5 : 0)
  const predicted = Math.max(0, Math.round(congestion + dwell * 0.6))

  const ciHalf = Math.round(predicted * 0.18) + 3
  const level = predicted >= 40 ? 'HIGH' : predicted >= 15 ? 'MODERATE' : 'LOW'

  // feature importance (normalized to 100%)
  const raw = {
    Traffic: (dep.mult - 1) * 2.2 + 0.15,
    Weather: (wx.mult - 1) * 2.6 + 0.05,
    Distance: freeFlowMin / 90,
    'Dwell time': v.dwell / 22,
    'Driver history': 0.14,
  }
  const sum = Object.values(raw).reduce((s, x) => s + x, 0)
  const features = Object.entries(raw)
    .map(([name, x]) => ({ name, value: Math.round((x / sum) * 100) }))
    .sort((a, b) => b.value - a.value)

  const top = features[0].name
  const RECO = {
    Traffic: `Departure window is the dominant factor. Shifting to an off-peak slot could cut the expected delay by roughly ${Math.round(predicted * 0.4)} min.`,
    Weather: `${wx.label} is driving most of the risk. Consider a covered vehicle and add a weather buffer to the customer ETA.`,
    Distance: `This is a long-haul leg. Pre-stage the shipment at a closer hub or split the route to protect the SLA.`,
    'Dwell time': `Handling/dwell dominates. Pre-print labels and confirm dock availability to compress turnaround.`,
    'Driver history': `Inputs look benign. Standard monitoring is sufficient — no special action required.`,
  }
  // For low-risk runs nothing meaningfully drives delay, so don't over-claim a cause.
  const recommendation =
    level === 'LOW'
      ? 'Conditions are favourable — expected delay is minimal. Standard monitoring is sufficient.'
      : RECO[top]

  return {
    distance: dist,
    predicted,
    ci: [Math.max(0, predicted - ciHalf), predicted + ciHalf],
    level,
    features,
    recommendation,
  }
}

/* ===================================================================== *
 *  SLA RISK
 * ===================================================================== */
export function computeSLA({ origin, destination, vehicle, departure, weather }) {
  const v = vehicleById[vehicle]
  const dep = departureById[departure]
  const wx = weatherById[weather]
  const dist = distanceKm(origin, destination)

  const vehicleAdj = v.id === 'truck' ? 9 : v.id === 'van' ? 4 : 1
  const parts = {
    'Traffic congestion': (dep.mult - 1) * 58,
    'Weather conditions': (wx.mult - 1) * 62,
    'Long-haul distance': clamp(dist / 2.6, 0, 26),
    'Vehicle / load profile': vehicleAdj,
    'Tight SLA window': 11,
  }
  const score = clamp(Math.round(Object.values(parts).reduce((s, x) => s + x, 0)), 4, 98)
  const level = score >= 67 ? 'HIGH' : score >= 34 ? 'MEDIUM' : 'LOW'

  const ranked = Object.entries(parts).sort((a, b) => b[1] - a[1])
  const top3 = ranked.slice(0, 3)
  const top3sum = top3.reduce((s, [, x]) => s + x, 0) || 1
  const factors = top3.map(([label, x]) => ({ label, pct: Math.round((x / top3sum) * 100) }))

  return { distance: dist, score, level, factors }
}

/** ~8 deterministic "similar at-risk shipments" that respond to the inputs. */
export function similarShipments(inputs, score) {
  const rng = mulberry32(seedFromInputs(inputs))
  const regions = ['JKT', 'BKS', 'TNG', 'DPK', 'BGR', 'KRW', 'BDG']
  const pairs = LOCATIONS.map((l) => l.name)
  const rows = []
  for (let i = 0; i < 8; i++) {
    const s = clamp(Math.round(score + (rng() - 0.45) * 34), 6, 99)
    const o = pairs[Math.floor(rng() * pairs.length)]
    let d = pairs[Math.floor(rng() * pairs.length)]
    if (d === o) d = pairs[(pairs.indexOf(d) + 1) % pairs.length]
    rows.push({
      id: `BLI-2026-${regions[Math.floor(rng() * regions.length)]}-${String(1000 + Math.floor(rng() * 8999)).padStart(6, '0')}`,
      route: `${o} → ${d}`,
      risk: s,
      slip: Math.round(s * 0.9 + rng() * 20),
      level: s >= 67 ? 'HIGH' : s >= 34 ? 'MEDIUM' : 'LOW',
    })
  }
  return rows.sort((a, b) => b.risk - a.risk)
}

/* ===================================================================== *
 *  CARBON FOOTPRINT
 * ===================================================================== */
export function computeCarbon({ vehicle, weightKg, distance }) {
  const v = vehicleById[vehicle]
  const weightTon = weightKg / 1000
  const distanceComp = distance * v.co2PerKm
  const loadComp = distance * v.loadFactor * weightTon
  const total = distanceComp + loadComp

  const breakdown = [
    { name: 'Fuel combustion', value: +(distanceComp * 0.64).toFixed(2), color: '#f59e0b' },
    { name: 'Distance', value: +(distanceComp * 0.36).toFixed(2), color: '#3b82f6' },
    { name: 'Load weight', value: +loadComp.toFixed(2), color: '#8b5cf6' },
  ]

  const industryAvg = +(total * 1.27).toFixed(2)
  const percentSaved = Math.round(((industryAvg - total) / industryAvg) * 100)
  const hash = seededHex(`${vehicle}|${weightKg}|${distance}`)

  return {
    total: +total.toFixed(2),
    breakdown,
    industryAvg,
    yours: +total.toFixed(2),
    percentSaved,
    hash,
  }
}
