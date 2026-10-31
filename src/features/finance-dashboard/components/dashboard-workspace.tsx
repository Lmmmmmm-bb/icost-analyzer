import { useCallback } from "react"

import { useFileDrop } from "../upload/use-file-drop"
import type { DashboardController } from "../hooks/use-dashboard-controller"
import { DashboardAlerts } from "./feedback/dashboard-alerts"
import { NoResultEmptyState } from "./feedback/empty-states"
import { ParsingStatusOverlay } from "./hero/parsing-status"
import { WorkspaceDropOverlay } from "./hero/workspace-drop-overlay"
import { WorkspaceHero } from "./hero/workspace-hero"
import { FilterDock } from "./filters/filter-dock"
import { AgentAccessPanel } from "./agent/agent-access-panel"
import { AnalysisCharts } from "./charts/analysis-charts"
import { FilterPanel } from "./filters/filter-panel"
import { RateSettings } from "./rates/rate-settings"
import { SummaryTables } from "./summaries/summary-tables"
import { TransactionTable } from "./transactions/transaction-table"

type DashboardWorkspaceProps = {
  dashboard: DashboardController
}

export function DashboardWorkspace({ dashboard }: DashboardWorkspaceProps) {
  const { analysis, display, uploadState, view, actions, exchange } = dashboard
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
        rangeText={display.rangeText}
        stats={analysis.stats}
        periodComparison={analysis.periodComparison}
        yearComparison={analysis.yearComparison}
        uploadState={uploadState}
        onUpload={dashboard.uploadWorkbook}
      />

      <AgentAccessPanel
        access={dashboard.agentAccess}
        isParsing={uploadState.isParsing}
        matchedRows={analysis.filtered.length}
        totalRows={dashboard.transactions.length}
        missingRates={analysis.missingRates}
      />

      <DashboardAlerts
        uploadError={uploadState.error}
        invalidDateRange={analysis.invalidDateRange}
        missingRates={analysis.missingRates}
        skippedRows={uploadState.skippedRows}
      />

      <FilterPanel
        filters={view.filters}
        asOf={dashboard.asOf}
        dimensions={analysis.dimensions}
        actions={actions.filters}
      />

      <FilterDock
        filters={view.filters}
        asOf={dashboard.asOf}
        filteredCount={analysis.filtered.length}
        totalCount={dashboard.transactions.length}
        actions={actions.filters}
      >
        <FilterPanel
          filters={view.filters}
          asOf={dashboard.asOf}
          dimensions={analysis.dimensions}
          actions={actions.filters}
          variant="dialog"
          className="shadow-none"
        />
      </FilterDock>

      <RateSettings
        currencies={analysis.dimensions.currencies}
        inputs={exchange.inputs}
        errors={exchange.errors}
        actions={exchange.actions}
      />

      {dashboard.hasAnalysisCharts ? (
        <>
          <SummaryTables
            categoryRows={display.sortedCategoryRows}
            tagRows={display.sortedTagRows}
            expenseTotal={display.expenseTotal}
            summarySort={view.summarySort}
            tagSort={view.tagSort}
            onSummarySortChange={actions.sortCategories}
            onTagSortChange={actions.sortTags}
            onCategorySelect={actions.selectCategory}
            onTagSelect={actions.selectTag}
          />

          <AnalysisCharts
            data={display.chartData}
            detailQueries={display.detailQueries}
            accountRows={display.sortedAccountRows}
            drillCategory={view.drillCategory}
            rankLevel={view.rankLevel}
            accountSort={view.accountSort}
            activeAccounts={view.filters.accounts}
            onApplyMonth={actions.applyMonth}
            onDrillCategoryChange={actions.drillCategory}
            onRankLevelChange={actions.changeRankLevel}
            onAccountSortChange={actions.sortAccounts}
            onAccountSelect={actions.selectAccount}
            onResetAccounts={actions.resetAccountFilter}
            onTagSelect={actions.selectTag}
          />
        </>
      ) : (
        <NoResultEmptyState />
      )}

      <TransactionTable
        rows={display.detailRows}
        pagedRows={display.pagedRows}
        safePage={display.safePage}
        totalPages={display.totalPages}
        pageSize={view.pageSize}
        detailSort={view.detailSort}
        rates={exchange.rates}
        onPageChange={actions.goToPage}
        onPageSizeChange={actions.changePageSize}
        onDetailSortChange={actions.sortDetails}
      />
    </div>
  )
}
