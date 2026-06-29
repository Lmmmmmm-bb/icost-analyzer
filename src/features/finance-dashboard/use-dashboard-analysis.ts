import { useMemo } from "react"

import {
  createCurrencyOption,
  createHeatmapOptionsByYear,
  createMonthlyOption,
  createPieOption,
  createRankingOption,
  createTagOption,
  createWeekOption,
} from "./components/charts/chart-options"
import { RANK_LEVELS, type RankLevel } from "./components/charts/types"
import type { SummarySort, TagSort } from "./components/summaries/types"
import type { DetailSort } from "./components/transactions/types"
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
import type { Filters, RateMap, Transaction } from "./model/types"

type DashboardAnalysisParams = {
  transactions: Transaction[]
  filters: Filters
  rates: RateMap
  resolvedTheme: "dark" | "light"
  drillCategory: string
  rankLevel: RankLevel
  summarySort: SummarySort
  tagSort: TagSort
  detailSort: DetailSort
  page: number
  pageSize: number
}

export function useDashboardAnalysis({
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
}: DashboardAnalysisParams) {
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
      monthlyOption: createMonthlyOption(monthly, resolvedTheme),
      pieOption: createPieOption(categoryPie, resolvedTheme),
      rankingOption: createRankingOption(ranking, resolvedTheme),
      currencyOption: createCurrencyOption(currencySummary, resolvedTheme),
      weekOption: createWeekOption(weekSummary, resolvedTheme),
      tagOption: createTagOption(tagSummary, resolvedTheme),
      heatmapOptions: createHeatmapOptionsByYear(heatmap, resolvedTheme),
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

  return {
    dimensions,
    invalidDateRange,
    filtered,
    missingRates,
    stats,
    detailRows,
    safePage,
    totalPages,
    pagedRows,
    expenseTotal,
    rangeText,
    chartOptions,
    sortedCategoryRows,
    sortedTagRows,
  }
}
