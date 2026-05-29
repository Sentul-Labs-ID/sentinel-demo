/**
 * Tiny className combiner (no clsx dependency needed for a prototype).
 * Filters falsy values and joins with spaces.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Format an integer with thousands separators (en-US grouping). */
export function formatNumber(n, opts = {}) {
  return new Intl.NumberFormat('en-US', opts).format(n)
}

/** Format Indonesian Rupiah, e.g. 1250000 -> "Rp 1.250.000". */
export function formatRupiah(n, { compact = false } = {}) {
  if (compact) {
    return (
      'Rp ' +
      new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(n)
    )
  }
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(n))
}

/** Format a percentage given a 0–100 number, e.g. 94.2 -> "94.2%". */
export function formatPercent(n, digits = 1) {
  return `${Number(n).toFixed(digits)}%`
}

/** Clamp a number between min and max. */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}

/**
 * Current time formatted for Jakarta (WIB, UTC+7).
 * Returns { date, time } strings.
 */
export function nowWIB() {
  const fmtDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const fmtTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return {
    date: fmtDate.format(new Date()),
    time: fmtTime.format(new Date()),
  }
}

/** Truncate a long hash/string to head…tail form. */
export function truncateHash(hash, head = 6, tail = 4) {
  if (!hash || hash.length <= head + tail + 1) return hash
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`
}

/**
 * Deterministic hex string from a seed (FNV-1a + xorshift).
 * Same seed always yields the same output — used to fake SHA-256 hashes
 * that stay stable across reloads so demos are repeatable.
 */
export function seededHex(seed, len = 64) {
  let h = 2166136261 >>> 0
  const str = String(seed)
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  const c = '0123456789abcdef'
  let out = ''
  for (let i = 0; i < len; i++) {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    h >>>= 0
    out += c[h & 15]
  }
  return out
}
