import { useCountUp } from '../../lib/useCountUp'

/**
 * Count-up number. <CountUp value={27} suffix=" min" />
 */
export default function CountUp({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration,
  className,
}) {
  const v = useCountUp(value, duration)
  return (
    <span className={className}>
      {prefix}
      {v.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
