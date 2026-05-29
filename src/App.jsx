import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppShell from './components/layout/AppShell'
import PageTransition from './components/layout/PageTransition'
import RouteFallback from './components/layout/RouteFallback'
import Placeholder from './pages/Placeholder'
import { NAV_ITEMS } from './lib/nav'

// Code-split every screen so heavy deps (recharts, react-force-graph-2d) load
// on demand — the Dashboard becomes interactive without paying for the graph
// modules up front.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DelayPrediction = lazy(() => import('./pages/DelayPrediction'))
const SLARisk = lazy(() => import('./pages/SLARisk'))
const CarbonFootprint = lazy(() => import('./pages/CarbonFootprint'))
const TrustLayer = lazy(() => import('./pages/TrustLayer'))
const FraudDetection = lazy(() => import('./pages/FraudDetection'))
const RouteOptimization = lazy(() => import('./pages/RouteOptimization'))
const CascadeSimulator = lazy(() => import('./pages/CascadeSimulator'))

const PAGES = {
  dashboard: Dashboard,
  delay: DelayPrediction,
  sla: SLARisk,
  carbon: CarbonFootprint,
  trust: TrustLayer,
  fraud: FraudDetection,
  route: RouteOptimization,
  cascade: CascadeSimulator,
}

export default function App() {
  const location = useLocation()

  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {NAV_ITEMS.map((item) => {
              const Page = PAGES[item.id]
              return (
                <Route
                  key={item.id}
                  path={item.path}
                  element={
                    <PageTransition>
                      {Page ? <Page /> : <Placeholder item={item} />}
                    </PageTransition>
                  }
                />
              )
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </AppShell>
  )
}
