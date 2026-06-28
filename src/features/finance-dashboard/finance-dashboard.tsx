import { useMemo, useState } from "react"

import {
  ALL_RANGE,
  DEFAULT_RATES,
  EMPTY_FILTERS,
  RANK_LEVELS,
} from "./model/constants"
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
import { DashboardAlerts } from "./components/feedback/dashboard-alerts"
import {
  NoResultEmptyState,
  UploadEmptyState,
} from "./components/feedback/empty-states"
import { FilterPanel } from "./components/filters/filter-panel"
import { DashboardHero } from "./components/hero/dashboard-hero"
import { MetricGrid } from "./components/metrics/metric-grid"
import { RateSettings } from "./components/rates/rate-settings"
import { SummaryTables } from "./components/summaries/summary-tables"
import { TransactionTable } from "./components/transactions/transaction-table"
import type {
  DetailSort,
  Filters,
  RankLevel,
  RateMap,
  SummarySort,
  TagSort,
  Transaction,
} from "./model/types"
import {
  dateKey,
  filterTransactions,
  getDateRange,
  getDimensions,
  getHeatmap,
  getMonthly,
  getStats,
  getWeekSummary,
  makeRateInputs,
  parseWorkbook,
  summarizeBy,
  toRmb,
  unique,
} from "./model/utils"

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
  const [error, setError] = useState("")

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
  const pagedRows = detailRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  )
  const expenseTotal =
    categorySummary.reduce((sum, item) => sum + item.amount, 0) || 1
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
      heatmapOption: createHeatmapOption(heatmap),
    }),
    [
      categoryPie,
      currencySummary,
      heatmap,
      monthly,
      ranking,
      tagSummary,
      weekSummary,
    ]
  )

  const sortedCategoryRows = [...categorySummary].sort((a, b) => {
    if (summarySort === "count") return b.count - a.count
    if (summarySort === "avg") return b.amount / b.count - a.amount / a.count
    return b.amount - a.amount
  })
  const sortedTagRows = [...tagSummary].sort((a, b) => {
    if (tagSort === "count") return b.count - a.count
    if (tagSort === "days") return b.days.size - a.days.size
    return b.amount - a.amount
  })

  async function handleUpload(file?: File) {
    if (!file) return
    try {
      setError("")
      const buffer = await file.arrayBuffer()
      const parsed = await parseWorkbook(buffer)
      if (!parsed.length)
        throw new Error("未识别到有效交易记录，请确认是 iCost 导出的 Excel。")
      setTransactions(parsed)
      setFileName(file.name)
      setFilters(EMPTY_FILTERS)
      setDrillCategory("")
      const currencies = unique(parsed.map((tx) => tx.currency))
      const nextRates = { ...DEFAULT_RATES }
      for (const currency of currencies)
        if (!nextRates[currency]) nextRates[currency] = 0
      setRates(nextRates)
      setRateInputs(makeRateInputs(nextRates))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Excel 解析失败"
      )
    }
  }

  function applyMonth(month: string) {
    setFilters((current) => ({
      ...current,
      quickRange: ALL_RANGE,
      year: "",
      startDate: `${month}-01`,
      endDate: dateKey(
        new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)
      ),
    }))
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.075)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.075)_1px,transparent_1px)] bg-[size:48px_48px]"
      />
      <DashboardHero
        fileName={fileName}
        error={error}
        rangeText={rangeText}
        totalCount={transactions.length}
        filteredCount={filtered.length}
        dimensions={dimensions}
        onUpload={handleUpload}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 md:px-8 lg:px-10">
        <DashboardAlerts
          invalidDateRange={invalidDateRange}
          missingRates={missingRates}
        />

        <FilterPanel
          filters={filters}
          dimensions={dimensions}
          onFiltersChange={setFilters}
          onResetDrill={() => setDrillCategory("")}
        />

        {!transactions.length ? (
          <UploadEmptyState />
        ) : (
          <>
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
                  onTagSelect={(tag) =>
                    setFilters((current) => ({ ...current, tags: [tag] }))
                  }
                />

                <SummaryTables
                  categoryRows={sortedCategoryRows}
                  tagRows={sortedTagRows}
                  expenseTotal={expenseTotal}
                  summarySort={summarySort}
                  tagSort={tagSort}
                  onSummarySortChange={setSummarySort}
                  onTagSortChange={setTagSort}
                  onCategorySelect={(category) =>
                    setFilters((current) => ({
                      ...current,
                      categories: [category],
                    }))
                  }
                  onTagSelect={(tag) =>
                    setFilters((current) => ({ ...current, tags: [tag] }))
                  }
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
          </>
        )}
      </div>
    </main>
  )
}
