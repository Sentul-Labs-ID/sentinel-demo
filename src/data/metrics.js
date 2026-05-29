/**
 * Dashboard hero metrics + 7-day chart series.
 * Numbers are internally consistent with the rest of the demo
 * (12,847 active shipments, 94.2% on-time, 8.4t carbon today).
 */

export const heroStats = [
  {
    id: 'active',
    label: 'Active Shipments',
    value: 12847,
    decimals: 0,
    delta: 4.2,
    trend: 'up',
    deltaPositive: true,
  },
  {
    id: 'ontime',
    label: 'On-Time Rate',
    value: 94.2,
    decimals: 1,
    suffix: '%',
    delta: 2.1,
    trend: 'up',
    deltaPositive: true,
  },
  {
    id: 'carbon',
    label: 'Carbon Today',
    value: 8.4,
    decimals: 1,
    suffix: 't',
    delta: 12,
    trend: 'down',
    deltaPositive: true, // lower carbon is good
  },
  {
    id: 'fraud',
    label: 'Fraud Flagged',
    value: 23,
    decimals: 0,
    delta: 15,
    trend: 'down',
    deltaPositive: true, // fewer flags clearing is good
  },
]

/** 7-day delivery performance: on-time rising, late falling. */
export const deliveryPerformance = [
  { day: 'Mon', onTime: 1684, late: 173 },
  { day: 'Tue', onTime: 1742, late: 151 },
  { day: 'Wed', onTime: 1798, late: 138 },
  { day: 'Thu', onTime: 1771, late: 142 },
  { day: 'Fri', onTime: 1863, late: 119 },
  { day: 'Sat', onTime: 1907, late: 104 },
  { day: 'Sun', onTime: 1951, late: 92 },
]

/** 7-day carbon intensity (tonnes CO2e/day): steady decline toward 8.4. */
export const carbonTrend = [
  { day: 'Mon', co2: 11.2 },
  { day: 'Tue', co2: 10.6 },
  { day: 'Wed', co2: 10.9 },
  { day: 'Thu', co2: 9.8 },
  { day: 'Fri', co2: 9.3 },
  { day: 'Sat', co2: 8.7 },
  { day: 'Sun', co2: 8.4 },
]

/** Industry baseline for the carbon chart reference line. */
export const carbonBaseline = 12.0
