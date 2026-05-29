import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'

/**
 * Animate a number from 0 → target once (and on target change).
 * Returns the raw current float; format at the call site.
 * Honors prefers-reduced-motion.
 */
export function useCountUp(target, duration = 1.1) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setV(target)
      return
    }
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: setV,
    })
    return () => controls.stop()
  }, [target, duration])
  return v
}
