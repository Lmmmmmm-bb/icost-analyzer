import { DashboardBackdrop } from "./components/layout/dashboard-backdrop"
import { DashboardWorkspace } from "./components/dashboard-workspace"
import { EntryHero } from "./components/hero/entry-hero"
import { useDashboardController } from "./hooks/use-dashboard-controller"

export function FinanceDashboard() {
  const dashboard = useDashboardController()

  return (
    <main
      className="relative min-h-svh overflow-hidden bg-background text-foreground"
      data-skip-theme-view-transition={
        dashboard.hasAnalysisCharts ? "true" : undefined
      }
    >
      <DashboardBackdrop />

      {!dashboard.hasTransactions ? (
        <EntryHero
          uploadState={dashboard.uploadState}
          onUpload={dashboard.uploadWorkbook}
        />
      ) : (
        <DashboardWorkspace dashboard={dashboard} />
      )}
    </main>
  )
}
