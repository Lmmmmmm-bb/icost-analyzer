import { lazy, Suspense, useEffect } from "react"

import { DashboardBackdrop } from "./components/layout/dashboard-backdrop"
import { EntryHero } from "./components/hero/entry-hero"
import { ParsingStatusOverlay } from "./components/hero/parsing-status"
import { useDashboardController } from "./hooks/use-dashboard-controller"

function loadDashboardWorkspace() {
  return import("./components/dashboard-workspace")
}

const DashboardWorkspace = lazy(() =>
  loadDashboardWorkspace().then((module) => ({
    default: module.DashboardWorkspace,
  }))
)

export function FinanceDashboard() {
  const dashboard = useDashboardController()

  useEffect(() => {
    if (dashboard.uploadState.isParsing) {
      void loadDashboardWorkspace().catch(() => undefined)
    }
  }, [dashboard.uploadState.isParsing])

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
        <Suspense
          fallback={
            <ParsingStatusOverlay
              fileName={
                dashboard.fileName || dashboard.uploadState.parsingFileName
              }
              title="正在准备分析看板"
              description="分析组件正在本地加载，账单数据不会离开当前浏览器。"
              className="fixed inset-0"
            />
          }
        >
          <DashboardWorkspace dashboard={dashboard} />
        </Suspense>
      )}
    </main>
  )
}
