import { useCallback, useMemo, useState } from "react"

import { useTheme } from "@/components/theme-provider"

import { ALL_RANGE, DEFAULT_RATES, EMPTY_FILTERS } from "./model/constants"
import {
  createCurrencyOption,
  createHeatmapOption,
  createMonthlyOption,
  createPieOption,
  createRankingOption,
  createTagOption,
  createWeekOption,
} from "./components/charts/chart-options"
import { AnalysisCharts } from "./components/charts/analysis-charts"
import { RANK_LEVELS, type RankLevel } from "./components/charts/types"
import { DashboardBackdrop } from "./components/dashboard-backdrop"
import { DashboardAlerts } from "./components/feedback/dashboard-alerts"
import { NoResultEmptyState } from "./components/feedback/empty-states"
import { FilterPanel } from "./components/filters/filter-panel"
import { EntryHero } from "./components/hero/entry-hero"
import { WorkspaceHero } from "./components/hero/workspace-hero"
import { MetricGrid } from "./components/metrics/metric-grid"
import { RateSettings } from "./components/rates/rate-settings"
import { makeRateInputs } from "./components/rates/rate-inputs"
import { SummaryTables } from "./components/summaries/summary-tables"
import type { SummarySort, TagSort } from "./components/summaries/types"
import { TransactionTable } from "./components/transactions/transaction-table"
import type { DetailSort } from "./components/transactions/types"
import type { Filters, RateMap, Transaction } from "./model/types"
import {
  getDateRange,
  getDimensions,
  getHeatmap,
  getMonthly,
  getStats,
  getWeekSummary,
  summarizeBy,
} from "./model/analytics"
import { unique } from "./model/collections"
import { dateKey } from "./model/date"
import { filterTransactions } from "./model/filtering"
import { toRmb } from "./model/money"
import { useWorkbookUpload } from "./components/hero/use-workbook-upload"

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

  const dimensions = useMemo(() => getDimensions(transactions), [transactions])
  const dateRange = useMemo(() => getDateRange(transactions), [transactions])
  const invalidDateRange = Boolean(
    filters.startDate &&
    filters.endDate &&
    new Date(filters.startDate) > new Date(filters.endDate)
  )
  const filtered = useMemo(
    () => filterTransactions(transactions, filters, invalidDateRange),
    [filters, invalidDateRange, transactions]
  )
  const missingRates = useMemo(
    () =>
      unique(
        filtered.map((tx) => tx.currency).filter((currency) => !rates[currency])
      ),
    [filtered, rates]
  )
  const stats = useMemo(() => getStats(filtered, rates), [filtered, rates])
  const monthly = useMemo(() => getMonthly(filtered, rates), [filtered, rates])
  const categorySummary = useMemo(
    () => summarizeBy(filtered, rates, (tx) => tx.category),
    [filtered, rates]
  )
  const subcategorySummary = useMemo(
    () => summarizeBy(filtered, rates, (tx) => tx.subcategory),
    [filtered, rates]
  )
  const tagSummary = useMemo(
    () => summarizeBy(filtered, rates, (tx) => tx.category, true),
    [filtered, rates]
  )
  const currencySummary = useMemo(
    () => summarizeBy(filtered, rates, (tx) => tx.currency),
    [filtered, rates]
  )
  const weekSummary = useMemo(
    () => getWeekSummary(filtered, rates),
    [filtered, rates]
  )
  const heatmap = useMemo(() => getHeatmap(filtered, rates), [filtered, rates])

  const detailRows = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (detailSort === "amount")
        return Math.abs(toRmb(b, rates)) - Math.abs(toRmb(a, rates))
      return b.date.getTime() - a.date.getTime()
    })
  }, [detailSort, filtered, rates])

  const totalPages = Math.max(1, Math.ceil(detailRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedRows = useMemo(
    () => detailRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [detailRows, pageSize, safePage]
  )
  const expenseTotal = useMemo(
    () => categorySummary.reduce((sum, item) => sum + item.amount, 0) || 1,
    [categorySummary]
  )
  const rangeText = dateRange
    ? `${dateKey(dateRange.start)} → ${dateKey(dateRange.end)}`
    : "等待上传"

  const categoryPie = useMemo(
    () =>
      drillCategory
        ? summarizeBy(
            filtered.filter((tx) => tx.category === drillCategory),
            rates,
            (tx) => tx.subcategory
          )
        : categorySummary,
    [categorySummary, drillCategory, filtered, rates]
  )
  const ranking = useMemo(
    () =>
      (rankLevel === RANK_LEVELS[0]
        ? categorySummary
        : subcategorySummary
      ).slice(0, 15),
    [categorySummary, rankLevel, subcategorySummary]
  )
  const chartOptions = useMemo(
    () => ({
      monthlyOption: createMonthlyOption(monthly),
      pieOption: createPieOption(categoryPie),
      rankingOption: createRankingOption(ranking),
      currencyOption: createCurrencyOption(currencySummary),
      weekOption: createWeekOption(weekSummary),
      tagOption: createTagOption(tagSummary),
      heatmapOption: createHeatmapOption(heatmap, resolvedTheme),
    }),
    [
      categoryPie,
      currencySummary,
      heatmap,
      monthly,
      ranking,
      resolvedTheme,
      tagSummary,
      weekSummary,
    ]
  )

  const sortedCategoryRows = useMemo(() => {
    return [...categorySummary].sort((a, b) => {
      if (summarySort === "count") return b.count - a.count
      if (summarySort === "avg") return b.amount / b.count - a.amount / a.count
      return b.amount - a.amount
    })
  }, [categorySummary, summarySort])
  const sortedTagRows = useMemo(() => {
    return [...tagSummary].sort((a, b) => {
      if (tagSort === "count") return b.count - a.count
      if (tagSort === "days") return b.days.size - a.days.size
      return b.amount - a.amount
    })
  }, [tagSort, tagSummary])

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
    setFilters((current) => ({ ...current, tags: [tag] }))
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
        <>
          <WorkspaceHero
            fileName={fileName}
            rangeText={rangeText}
            totalCount={transactions.length}
            filteredCount={filtered.length}
            dimensions={dimensions}
            onReplaceFile={resetWorkbook}
          />

          <div className="ledger-rise relative mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 [animation-delay:90ms] md:px-8 lg:gap-6 lg:px-10">
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

            <MetricGrid stats={stats} />

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

            <RateSettings
              dimensions={dimensions}
              rateInputs={rateInputs}
              onRateInputsChange={setRateInputs}
              onRatesChange={setRates}
            />

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
        </>
      )}
    </main>
  )
}
