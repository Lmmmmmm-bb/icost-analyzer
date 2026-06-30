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
  getDailyCashflow,
  getDateRange,
  getDimensions,
  getHeatmap,
  getMonthly,
  getPeriodComparison,
  getStats,
  getWeekSummary,
  summarizeBy,
} from "./model/analytics"
import { unique } from "./model/collections"
import { ALL_RANGE } from "./model/constants"
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

type DatePeriod = {
  start: Date
  end: Date
  label: string
}

const RANGE_ARROW = "→"

function normalizeStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function normalizeEnd(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )
}

function formatPeriodLabel(start: Date, end: Date) {
  const startKey = dateKey(start)
  const endKey = dateKey(end)
  return startKey === endKey ? startKey : `${startKey} ${RANGE_ARROW} ${endKey}`
}

function createDatePeriod(start: Date, end: Date): DatePeriod {
  const normalizedStart = normalizeStart(start)
  const normalizedEnd = normalizeEnd(end)
  return {
    start: normalizedStart,
    end: normalizedEnd,
    label: formatPeriodLabel(normalizedStart, normalizedEnd),
  }
}

function getCurrentDatePeriod(
  filters: Filters,
  filtered: Transaction[]
): DatePeriod | null {
  const dataRange = getDateRange(filtered)

  if (filters.startDate || filters.endDate) {
    const start = filters.startDate
      ? new Date(`${filters.startDate}T00:00:00`)
      : dataRange?.start
    const end = filters.endDate
      ? new Date(`${filters.endDate}T23:59:59`)
      : dataRange?.end
    return start && end ? createDatePeriod(start, end) : null
  }

  if (filters.year) {
    return createDatePeriod(
      new Date(`${filters.year}-01-01T00:00:00`),
      new Date(`${filters.year}-12-31T23:59:59`)
    )
  }

  if (filters.quickRange !== ALL_RANGE) {
    const now = new Date()
    if (filters.quickRange === "今年") {
      return createDatePeriod(
        new Date(`${now.getFullYear()}-01-01T00:00:00`),
        now
      )
    }

    const months = Number(filters.quickRange.match(/\d+/)?.[0] ?? 0)
    const start = new Date(now)
    start.setMonth(start.getMonth() - months)
    return createDatePeriod(start, now)
  }

  return dataRange ? createDatePeriod(dataRange.start, dataRange.end) : null
}

function getPreviousDatePeriod(period: DatePeriod): DatePeriod {
  const periodLength = period.end.getTime() - period.start.getTime()
  const previousEnd = new Date(period.start.getTime() - 1)
  const previousStart = new Date(previousEnd.getTime() - periodLength)
  return createDatePeriod(previousStart, previousEnd)
}

function getYearOverYearDatePeriod(period: DatePeriod): DatePeriod {
  const previousYearStart = new Date(period.start)
  const previousYearEnd = new Date(period.end)
  previousYearStart.setFullYear(previousYearStart.getFullYear() - 1)
  previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1)
  return createDatePeriod(previousYearStart, previousYearEnd)
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
  const currentPeriod = useMemo(
    () => (invalidDateRange ? null : getCurrentDatePeriod(filters, filtered)),
    [filtered, filters, invalidDateRange]
  )
  const previousPeriod = useMemo(
    () => (currentPeriod ? getPreviousDatePeriod(currentPeriod) : null),
    [currentPeriod]
  )
  const yearOverYearPeriod = useMemo(
    () => (currentPeriod ? getYearOverYearDatePeriod(currentPeriod) : null),
    [currentPeriod]
  )
  const previousScope = useMemo(() => {
    if (!previousPeriod) return []
    if (invalidDateRange) return []
    return filterTransactions(
      transactions,
      {
        ...filters,
        quickRange: ALL_RANGE,
        year: "",
        startDate: dateKey(previousPeriod.start),
        endDate: dateKey(previousPeriod.end),
      },
      false
    )
  }, [filters, invalidDateRange, previousPeriod, transactions])
  const yearOverYearScope = useMemo(() => {
    if (!yearOverYearPeriod) return []
    if (invalidDateRange) return []
    return filterTransactions(
      transactions,
      {
        ...filters,
        quickRange: ALL_RANGE,
        year: "",
        startDate: dateKey(yearOverYearPeriod.start),
        endDate: dateKey(yearOverYearPeriod.end),
      },
      false
    )
  }, [filters, invalidDateRange, transactions, yearOverYearPeriod])
  const missingRates = useMemo(
    () =>
      unique(
        filtered.map((tx) => tx.currency).filter((currency) => !rates[currency])
      ),
    [filtered, rates]
  )
  const stats = useMemo(() => getStats(filtered, rates), [filtered, rates])
  const periodComparison = useMemo(
    () =>
      getPeriodComparison(
        filtered,
        previousScope,
        currentPeriod?.label ?? "",
        previousPeriod?.label ?? "",
        rates
      ),
    [currentPeriod, filtered, previousPeriod, previousScope, rates]
  )
  const yearComparison = useMemo(
    () =>
      getPeriodComparison(
        filtered,
        yearOverYearScope,
        currentPeriod?.label ?? "",
        yearOverYearPeriod?.label ?? "",
        rates
      ),
    [currentPeriod, filtered, rates, yearOverYearPeriod, yearOverYearScope]
  )
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
  const dailyCashflow = useMemo(
    () => getDailyCashflow(filtered, rates),
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
      dailyCashflow,
    }),
    [
      categoryPie,
      currencySummary,
      dailyCashflow,
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
  }
}
