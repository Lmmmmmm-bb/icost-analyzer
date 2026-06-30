import { lazy, Suspense } from "react"

const FinanceDashboard = lazy(() =>
  import("@/features/finance-dashboard").then((module) => ({
    default: module.FinanceDashboard,
  }))
)

function App() {
  return (
    <Suspense fallback={null}>
      <FinanceDashboard />
    </Suspense>
  )
}

export default App
