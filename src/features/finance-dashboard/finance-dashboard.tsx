import { lazy, Suspense, useCallback, useState } from "react"

import { ALL_RANGE, DEFAULT_RATES, EMPTY_FILTERS } from "./model/constants"
import { DashboardBackdrop } from "./components/layout/dashboard-backdrop"
import { DashboardAlerts } from "./components/feedback/dashboard-alerts"
import { NoResultEmptyState } from "./components/feedback/empty-states"
import { EntryHero } from "./components/hero/entry-hero"
import { WorkspaceHero } from "./components/hero/workspace-hero"
import {
  RANK_LEVELS,
  type DetailSort,
  type RankLevel,
  type SummarySort,
  type TagSort,
} from "./model/dashboard-controls"
import { makeRateInputs } from "./model/rate-inputs"
import type { Filters, RateMap, Transaction } from "./model/types"
import { unique } from "./model/collections"
import { dateKey } from "./model/date"
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
  } = useDashboardAnalysis({
    transactions,
    filters,
    rates,
    drillCategory,
    rankLevel,
    summarySort,
    tagSort,
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
    setDetailSort("date")
    setPage(1)
  }, [])

  const applyParsedWorkbook = useCallback(
    (parsed: Transaction[], file: File) => {
      setTransactions(parsed)
      setFileName(file.name)
      resetAnalysisControls()
      const currencies = unique(parsed.map((tx) => tx.currency))
      const nextRates = { ...DEFAULT_RATES }
      for (const currency of currencies)
        if (!nextRates[currency]) nextRates[currency] = 0
      setRates(nextRates)
      setRateInputs(makeRateInputs(nextRates))
    },
    [resetAnalysisControls]
  )

  const { uploadState, uploadWorkbook, resetUpload } = useWorkbookUpload({
    onParsed: applyParsedWorkbook,
  })

  const resetWorkbook = useCallback(() => {
    setTransactions([])
    setFileName("")
    setRates(DEFAULT_RATES)
    setRateInputs(makeRateInputs(DEFAULT_RATES))
    resetAnalysisControls()
    setPageSize(25)
    resetUpload()
  }, [resetAnalysisControls, resetUpload])

  const applyMonth = useCallback((month: string) => {
    setFilters((current) => ({
      ...current,
      quickRange: ALL_RANGE,
      year: "",
      startDate: `${month}-01`,
      endDate: dateKey(
        new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)
      ),
    }))
  }, [])

  const resetDrill = useCallback(() => setDrillCategory(""), [])
  const selectTag = useCallback((tag: string) => {
    setFilters((current) => ({ ...current, tags: [tag], excludedTags: [] }))
  }, [])
  const selectCategory = useCallback((category: string) => {
    setFilters((current) => ({ ...current, categories: [category] }))
  }, [])

  const hasTransactions = transactions.length > 0

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <DashboardBackdrop />

      {!hasTransactions ? (
        <EntryHero uploadState={uploadState} onUpload={uploadWorkbook} />
      ) : (
        <Suspense fallback={null}>
          <div className="ledger-rise relative mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 [animation-delay:90ms] md:px-8 lg:gap-6 lg:px-10 lg:py-6">
            <WorkspaceHero
              fileName={fileName}
              rangeText={rangeText}
              stats={stats}
              periodComparison={periodComparison}
              yearComparison={yearComparison}
              onReplaceFile={resetWorkbook}
            />

            <DashboardAlerts
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

            {filtered.length ? (
              <>
                <AnalysisCharts
                  data={chartData}
                  drillCategory={drillCategory}
                  rankLevel={rankLevel}
                  onApplyMonth={applyMonth}
                  onDrillCategoryChange={setDrillCategory}
                  onRankLevelChange={setRankLevel}
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
