import { motion } from 'framer-motion'

/**
 * Page transition: fade + subtle slide-up over 200ms, ease-out.
 * Wrap each routed page so AnimatePresence can animate enter/exit.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
