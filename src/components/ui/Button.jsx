import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const VARIANTS = {
  primary:
    'bg-accent text-bg font-semibold hover:bg-amber-400 border border-accent shadow-[0_0_0_1px_rgba(245,158,11,0.15)]',
  secondary:
    'bg-surface text-text border border-border-hi hover:border-accent/60 hover:bg-surface-2',
  ghost: 'bg-transparent text-text-dim border border-transparent hover:text-text hover:bg-surface',
  danger:
    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium select-none',
        'transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={2.25} />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" strokeWidth={2.25} />}
    </motion.button>
  )
}
