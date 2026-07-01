import { lazy, Suspense, useCallback, useState } from "react"

import { DEFAULT_RATES, EMPTY_FILTERS } from "./model/constants"
import { DashboardBackdrop } from "./components/layout/dashboard-backdrop"
import { DashboardAlerts } from "./components/feedback/dashboard-alerts"
import { NoResultEmptyState } from "./components/feedback/empty-states"
import { EntryHero } from "./components/hero/entry-hero"
import { ParsingStatusOverlay } from "./components/hero/parsing-status"
import { useFileDrop } from "./components/hero/use-file-drop"
import { WorkspaceDropOverlay } from "./components/hero/workspace-drop-overlay"
import { WorkspaceHero } from "./components/hero/workspace-hero"
import {
  type AccountSort,
  RANK_LEVELS,
  type DetailSort,
  type RankLevel,
  type SummarySort,
  type TagSort,
} from "./model/dashboard-controls"
import { createRatesForCurrencies, makeRateInputs } from "./model/rate-inputs"
import type { Filters, RateMap, Transaction } from "./model/types"
import { unique } from "./model/collections"
import { getMonthDateRange } from "./model/date"
import { useWorkbookUpload } from "./components/hero/use-workbook-upload"
import { useDashboardAnalysis } from "./hooks/use-dashboard-analysis"

const AnalysisCharts = lazy(() =>
  import("./components/charts/analysis-charts").then((module) => ({
    default: module.AnalysisCharts,
  }))
)

const FilterPanel = lazy(() =>
  import("./components/filters/filter-panel").then((module) => ({
    default: module.FilterPanel,
  }))
)

const RateSettings = lazy(() =>
  import("./components/rates/rate-settings").then((module) => ({
    default: module.RateSettings,
  }))
)

const SummaryTables = lazy(() =>
  import("./components/summaries/summary-tables").then((module) => ({
    default: module.SummaryTables,
  }))
)

const TransactionTable = lazy(() =>
  import("./components/transactions/transaction-table").then((module) => ({
    default: module.TransactionTable,
  }))
)

export function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fileName, setFileName] = useState("")
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [rates, setRates] = useState<RateMap>(DEFAULT_RATES)
  const [rateInputs, setRateInputs] = useState<Record<string, string>>(
    makeRateInputs(DEFAULT_RATES)
  )
  const [drillCategory, setDrillCategory] = useState("")
  const [rankLevel, setRankLevel] = useState<RankLevel>(RANK_LEVELS[0])
  const [summarySort, setSummarySort] = useState<SummarySort>("amount")
  const [tagSort, setTagSort] = useState<TagSort>("amount")
  const [accountSort, setAccountSort] = useState<AccountSort>("amount")
  const [detailSort, setDetailSort] = useState<DetailSort>("date")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const {
    dimensions,
    invalidDateRange,
    filtered,
    missingRates,
    stats,
    periodComparison,
    yearComparison,
    detailRows,
    safePage,
    totalPages,
    pagedRows,
    expenseTotal,
    rangeText,
    chartData,
    sortedCategoryRows,
    sortedTagRows,
    sortedAccountRows,
  } = useDashboardAnalysis({
    transactions,
    filters,
    rates,
    drillCategory,
    rankLevel,
    summarySort,
    tagSort,
    accountSort,
    detailSort,
    page,
    pageSize,
  })

  const resetAnalysisControls = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setDrillCategory("")
    setRankLevel(RANK_LEVELS[0])
    setSummarySort("amount")
    setTagSort("amount")
    setAccountSort("amount")
    setDetailSort("date")
    setPage(1)
  }, [])

  const applyParsedWorkbook = useCallback(
    (parsed: Transaction[], file: File) => {
      setTransactions(parsed)
      setFileName(file.name)
      resetAnalysisControls()
      const currencies = unique(parsed.map((tx) => tx.currency))
      const nextRates = createRatesForCurrencies(currencies)
      setRates(nextRates)
      setRateInputs(makeRateInputs(nextRates))
    },
    [resetAnalysisControls]
  )

  const { uploadState, uploadWorkbook } = useWorkbookUpload({
    onParsed: applyParsedWorkbook,
  })

  const hasTransactions = transactions.length > 0
  const hasAnalysisCharts = filtered.length > 0

  const handleWorkspaceFileDrop = useCallback(
    (file: File) => {
      if (!uploadState.isParsing) uploadWorkbook(file)
    },
    [uploadState.isParsing, uploadWorkbook]
  )

  const { isDragging: isWorkspaceDragging, dropProps: workspaceDropProps } =
    useFileDrop(handleWorkspaceFileDrop, {
      disabled: uploadState.isParsing || !hasTransactions,
    })

  const applyMonth = useCallback((month: string) => {
    setFilters((current) => ({
      ...current,
      quickRange: EMPTY_FILTERS.quickRange,
      year: "",
      ...getMonthDateRange(month),
    }))
  }, [])

  const resetDrill = useCallback(() => setDrillCategory(""), [])
  const selectTag = useCallback((tag: string) => {
    setFilters((current) => ({ ...current, tags: [tag], excludedTags: [] }))
  }, [])
  const selectCategory = useCallback((category: string) => {
    setFilters((current) => ({ ...current, categories: [category] }))
  }, [])
  const selectAccount = useCallback((account: string) => {
    setFilters((current) => ({ ...current, accounts: [account] }))
  }, [])

  return (
    <main
      className="relative min-h-svh overflow-hidden bg-background text-foreground"
      data-skip-theme-view-transition={hasAnalysisCharts ? "true" : undefined}
      {...workspaceDropProps}
    >
      <DashboardBackdrop />

      {!hasTransactions ? (
        <EntryHero uploadState={uploadState} onUpload={uploadWorkbook} />
      ) : (
        <Suspense fallback={null}>
          <div className="ledger-stagger-stack relative mx-auto flex min-h-svh max-w-7xl flex-col gap-5 px-5 py-5 md:px-8 lg:gap-6 lg:px-10 lg:py-6">
            {isWorkspaceDragging ? <WorkspaceDropOverlay /> : null}
            {uploadState.showParsingStatus ? (
              <ParsingStatusOverlay
                fileName={uploadState.parsingFileName}
                className="fixed inset-0"
              />
            ) : null}
            <WorkspaceHero
              fileName={fileName}
              rangeText={rangeText}
              stats={stats}
              periodComparison={periodComparison}
              yearComparison={yearComparison}
              uploadState={uploadState}
              onUpload={uploadWorkbook}
            />

            <DashboardAlerts
              uploadError={uploadState.error}
              invalidDateRange={invalidDateRange}
              missingRates={missingRates}
            />

            <FilterPanel
              filters={filters}
              dimensions={dimensions}
              onFiltersChange={setFilters}
              onResetDrill={resetDrill}
            />

            <RateSettings
              dimensions={dimensions}
              rateInputs={rateInputs}
              onRateInputsChange={setRateInputs}
              onRatesChange={setRates}
            />

            {hasAnalysisCharts ? (
              <>
                <AnalysisCharts
                  data={chartData}
                  accountRows={sortedAccountRows}
                  drillCategory={drillCategory}
                  rankLevel={rankLevel}
                  accountSort={accountSort}
                  onApplyMonth={applyMonth}
                  onDrillCategoryChange={setDrillCategory}
                  onRankLevelChange={setRankLevel}
                  onAccountSortChange={setAccountSort}
                  onAccountSelect={selectAccount}
                  onTagSelect={selectTag}
                />

                <SummaryTables
                  categoryRows={sortedCategoryRows}
                  tagRows={sortedTagRows}
                  expenseTotal={expenseTotal}
                  summarySort={summarySort}
                  tagSort={tagSort}
                  onSummarySortChange={setSummarySort}
                  onTagSortChange={setTagSort}
                  onCategorySelect={selectCategory}
                  onTagSelect={selectTag}
                />
              </>
            ) : (
              <NoResultEmptyState />
            )}

            <TransactionTable
              rows={detailRows}
              pagedRows={pagedRows}
              safePage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              detailSort={detailSort}
              rates={rates}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onDetailSortChange={setDetailSort}
            />
          </div>
        </Suspense>
      )}
    </main>
  )
}
