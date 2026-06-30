import { useCallback, useState } from "react"

import { useTheme } from "@/components/theme-provider"

import { ALL_RANGE, DEFAULT_RATES, EMPTY_FILTERS } from "./model/constants"
import { AnalysisCharts } from "./components/charts/analysis-charts"
import { DashboardBackdrop } from "./components/layout/dashboard-backdrop"
import { DashboardAlerts } from "./components/feedback/dashboard-alerts"
import { NoResultEmptyState } from "./components/feedback/empty-states"
import { FilterPanel } from "./components/filters/filter-panel"
import { EntryHero } from "./components/hero/entry-hero"
import { WorkspaceHero } from "./components/hero/workspace-hero"
import { RateSettings } from "./components/rates/rate-settings"
import { SummaryTables } from "./components/summaries/summary-tables"
import { TransactionTable } from "./components/transactions/transaction-table"
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

export function FinanceDashboard() {
  const { resolvedTheme } = useTheme()
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
    chartOptions,
    sortedCategoryRows,
    sortedTagRows,
  } = useDashboardAnalysis({
    transactions,
    filters,
    rates,
    resolvedTheme,
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
                options={chartOptions}
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
      )}
    </main>
  )
}
