import { lazy, Suspense } from "react"

const FinanceDashboard = lazy(() =>
  import("@/features/finance-dashboard/finance-dashboard").then((module) => ({
    default: module.FinanceDashboard,
  }))
)

export function App() {
  return (
    <Suspense fallback={null}>
      <FinanceDashboard />
    </Suspense>
  )
}

export default App
