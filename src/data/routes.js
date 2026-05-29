/**
 * Route Optimization — deterministic 3-route solver + Pareto frontier.
 * Responds to origin/destination, vehicle, and the 3 priority sliders.
 */
import { distanceKm, vehicleById } from './logistics'

const COST_PER_KM = { motor: 2800, van: 7200, truck: 13500 }
const HANDLING = 8000

export const ROUTE_COLORS = {
  fastest: '#f59e0b',
  greenest: '#10b981',
  cheapest: '#3b82f6',
}

const round500 = (n) => Math.round(n / 500) * 500

export function computeRoutes({ origin, destination, vehicle, priorities }) {
  const v = vehicleById[vehicle]
  const dist = distanceKm(origin, destination)
  const baseTime = (dist / v.citySpeed) * 60
  const baseCost = HANDLING + dist * (COST_PER_KM[vehicle] ?? 7000)
  const baseCarbon = dist * v.co2PerKm

  const defs = [
    { id: 'fastest', name: 'Fastest', tMul: 0.8, cMul: 1.2, gMul: 1.15, curve: -14 },
    { id: 'greenest', name: 'Greenest', tMul: 1.1, cMul: 1.06, gMul: 0.72, curve: 6 },
    { id: 'cheapest', name: 'Cheapest', tMul: 1.18, cMul: 0.8, gMul: 1.02, curve: 20 },
  ]

  let routes = defs.map((d) => ({
    id: d.id,
    name: d.name,
    color: ROUTE_COLORS[d.id],
    curve: d.curve,
    time: Math.round(baseTime * d.tMul),
    cost: round500(baseCost * d.cMul),
    carbon: +(baseCarbon * d.gMul).toFixed(1),
  }))

  // weighted recommendation from the priority sliders (lower metric = better)
  const norm = (key) => {
    const vals = routes.map((r) => r[key])
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    return (x) => (max === min ? 1 : 1 - (x - min) / (max - min))
  }
  const nT = norm('time')
  const nC = norm('cost')
  const nG = norm('carbon')
  const wSum = (priorities.speed + priorities.cost + priorities.carbon) || 1
  routes = routes.map((r) => ({
    ...r,
    score:
      (priorities.speed * nT(r.time) +
        priorities.cost * nC(r.cost) +
        priorities.carbon * nG(r.carbon)) /
      wSum,
  }))
  const best = routes.reduce((a, b) => (b.score > a.score ? b : a), routes[0])
  routes = routes.map((r) => ({ ...r, recommended: r.id === best.id }))

  // Pareto frontier: the 3 named (on the frontier) + dominated candidates
  const pareto = [
    ...routes.map((r) => ({ cost: r.cost, carbon: r.carbon, time: r.time, name: r.name, color: r.color, highlight: true })),
  ]
  const seeds = [0.17, 0.41, 0.58, 0.73, 0.89]
  seeds.forEach((s, i) => {
    pareto.push({
      cost: round500(baseCost * (0.95 + s * 0.5)),
      carbon: +(baseCarbon * (0.85 + ((i % 3) + s) * 0.22)).toFixed(1),
      time: Math.round(baseTime * (0.9 + s * 0.4)),
      name: 'Candidate',
      color: '#475569',
      highlight: false,
    })
  })

  return { distance: dist, routes, pareto }
}
