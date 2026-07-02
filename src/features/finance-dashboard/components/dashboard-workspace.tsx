import { lazy, Suspense, useCallback } from "react"

import { useFileDrop } from "../upload/use-file-drop"
import type { DashboardController } from "../hooks/use-dashboard-controller"
import { DashboardAlerts } from "./feedback/dashboard-alerts"
import { NoResultEmptyState } from "./feedback/empty-states"
import { ParsingStatusOverlay } from "./hero/parsing-status"
import { WorkspaceDropOverlay } from "./hero/workspace-drop-overlay"
import { WorkspaceHero } from "./hero/workspace-hero"

const AnalysisCharts = lazy(() =>
  import("./charts/analysis-charts").then((module) => ({
    default: module.AnalysisCharts,
  }))
)

const FilterPanel = lazy(() =>
  import("./filters/filter-panel").then((module) => ({
    default: module.FilterPanel,
  }))
)

const RateSettings = lazy(() =>
  import("./rates/rate-settings").then((module) => ({
    default: module.RateSettings,
  }))
)

const SummaryTables = lazy(() =>
  import("./summaries/summary-tables").then((module) => ({
    default: module.SummaryTables,
  }))
)

const TransactionTable = lazy(() =>
  import("./transactions/transaction-table").then((module) => ({
    default: module.TransactionTable,
  }))
)

type DashboardWorkspaceProps = {
  dashboard: DashboardController
}

export function DashboardWorkspace({ dashboard }: DashboardWorkspaceProps) {
  const { analysis, uploadState } = dashboard
  const handleWorkspaceFileDrop = useCallback(
    (file: File) => {
      if (!uploadState.isParsing) dashboard.uploadWorkbook(file)
    },
    [dashboard, uploadState.isParsing]
  )

  const { isDragging: isWorkspaceDragging, dropProps: workspaceDropProps } =
    useFileDrop(handleWorkspaceFileDrop, {
      disabled: uploadState.isParsing || !dashboard.hasTransactions,
    })

  return (
    <Suspense fallback={null}>
      <div
        className="ledger-stagger-stack relative mx-auto flex min-h-svh max-w-7xl flex-col gap-5 px-5 py-5 md:px-8 lg:gap-6 lg:px-10 lg:py-6"
        {...workspaceDropProps}
      >
        {isWorkspaceDragging ? <WorkspaceDropOverlay /> : null}
        {uploadState.showParsingStatus ? (
          <ParsingStatusOverlay
            fileName={uploadState.parsingFileName}
            className="fixed inset-0"
          />
        ) : null}
        <WorkspaceHero
          fileName={dashboard.fileName}
          rangeText={analysis.rangeText}
          stats={analysis.stats}
          periodComparison={analysis.periodComparison}
          yearComparison={analysis.yearComparison}
          uploadState={uploadState}
          onUpload={dashboard.uploadWorkbook}
        />

        <DashboardAlerts
          uploadError={uploadState.error}
          invalidDateRange={analysis.invalidDateRange}
          missingRates={analysis.missingRates}
        />

        <FilterPanel
          filters={dashboard.filters}
          dimensions={analysis.dimensions}
          onFiltersChange={dashboard.setFilters}
          onResetDrill={dashboard.resetDrill}
        />

        <RateSettings
          dimensions={analysis.dimensions}
          rateInputs={dashboard.rateInputs}
          onRateInputsChange={dashboard.setRateInputs}
          onRatesChange={dashboard.setRates}
        />

        {dashboard.hasAnalysisCharts ? (
          <>
            <AnalysisCharts
              data={analysis.chartData}
              accountRows={analysis.sortedAccountRows}
              drillCategory={dashboard.drillCategory}
              rankLevel={dashboard.rankLevel}
              accountSort={dashboard.accountSort}
              onApplyMonth={dashboard.applyMonth}
              onDrillCategoryChange={dashboard.setDrillCategory}
              onRankLevelChange={dashboard.setRankLevel}
              onAccountSortChange={dashboard.setAccountSort}
              onAccountSelect={dashboard.selectAccount}
              onTagSelect={dashboard.selectTag}
            />

            <SummaryTables
              categoryRows={analysis.sortedCategoryRows}
              tagRows={analysis.sortedTagRows}
              expenseTotal={analysis.expenseTotal}
              summarySort={dashboard.summarySort}
              tagSort={dashboard.tagSort}
              onSummarySortChange={dashboard.setSummarySort}
              onTagSortChange={dashboard.setTagSort}
              onCategorySelect={dashboard.selectCategory}
              onTagSelect={dashboard.selectTag}
            />
          </>
        ) : (
          <NoResultEmptyState />
        )}

        <TransactionTable
          rows={analysis.detailRows}
          pagedRows={analysis.pagedRows}
          safePage={analysis.safePage}
          totalPages={analysis.totalPages}
          pageSize={dashboard.pageSize}
          detailSort={dashboard.detailSort}
          rates={dashboard.rates}
          onPageChange={dashboard.setPage}
          onPageSizeChange={dashboard.setPageSize}
          onDetailSortChange={dashboard.setDetailSort}
        />
      </div>
    </Suspense>
  )
}
