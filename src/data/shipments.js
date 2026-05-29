/**
 * Mock shipment identifiers + the live alert feed pool.
 * Everything here is deterministic so demos are repeatable.
 */

/** Format a Blibli-style shipment ID: BLI-2026-JKT-001247 */
export function shipmentId(seq, region = 'JKT') {
  return `BLI-2026-${region}-${String(seq).padStart(6, '0')}`
}

/**
 * Alert templates cycled through by the live feed.
 * severity: 'danger' | 'warning' | 'info'
 * type:     'SLA Risk' | 'Fraud Flag' | 'Cascade Warning'
 */
export const alertPool = [
  {
    severity: 'danger',
    type: 'Fraud Flag',
    message: 'GPS coordinates jumped 11.8 km in 38s — possible spoofing.',
    shipment: shipmentId(1247),
  },
  {
    severity: 'warning',
    type: 'SLA Risk',
    message: 'Rain + peak hour: predicted 47-min delay on Cikarang → Bekasi.',
    shipment: shipmentId(1812, 'BKS'),
  },
  {
    severity: 'info',
    type: 'Cascade Warning',
    message: 'Karawang hub at 91% capacity — downstream congestion likely.',
    shipment: shipmentId(2034, 'KRW'),
  },
  {
    severity: 'danger',
    type: 'Fraud Flag',
    message: 'COD account linked to 3 previously flagged phone numbers.',
    shipment: shipmentId(1559),
  },
  {
    severity: 'warning',
    type: 'SLA Risk',
    message: 'Driver idle 22 min past pickup window in Depok zone.',
    shipment: shipmentId(1903, 'DPK'),
  },
  {
    severity: 'info',
    type: 'Cascade Warning',
    message: 'Bandung inbound delayed — 14 shipments may slip SLA by 2h.',
    shipment: shipmentId(2210, 'BDG'),
  },
  {
    severity: 'warning',
    type: 'Fraud Flag',
    message: 'Delivery photo hash mismatch on proof-of-delivery upload.',
    shipment: shipmentId(1688),
  },
  {
    severity: 'danger',
    type: 'SLA Risk',
    message: 'High-value order stalled 3h at Tangerang sort facility.',
    shipment: shipmentId(1421, 'TNG'),
  },
  {
    severity: 'info',
    type: 'Cascade Warning',
    message: 'Weather advisory: Bogor corridor flood risk in next 6h.',
    shipment: shipmentId(2098, 'BGR'),
  },
  {
    severity: 'warning',
    type: 'SLA Risk',
    message: 'Reported emissions deviate +18% from route baseline.',
    shipment: shipmentId(1777),
  },
  {
    severity: 'danger',
    type: 'Fraud Flag',
    message: 'Odometer reading inconsistent with recorded route distance.',
    shipment: shipmentId(1934),
  },
  {
    severity: 'info',
    type: 'Cascade Warning',
    message: 'Cikarang → Bandung leg rerouted around KM-72 incident.',
    shipment: shipmentId(2255, 'BDG'),
  },
]

/** Seed the feed with a few alerts already aged into the past (in seconds). */
export const seedAlerts = [
  { ...alertPool[0], ageSec: 8 },
  { ...alertPool[2], ageSec: 41 },
  { ...alertPool[4], ageSec: 96 },
  { ...alertPool[6], ageSec: 184 },
  { ...alertPool[8], ageSec: 327 },
]
