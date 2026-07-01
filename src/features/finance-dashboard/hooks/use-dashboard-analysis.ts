import { useMemo } from "react"

import {
  type AccountSort,
  RANK_LEVELS,
  type DetailSort,
  type RankLevel,
  type SummarySort,
  type TagSort,
} from "../model/dashboard-controls"
import {
  paginateRows,
  sortAccountSummaryRows,
  sortCategorySummaryRows,
  sortDetailRows,
  sortTagSummaryRows,
} from "../model/dashboard-rows"
import {
  getCurrentDatePeriod,
  getPreviousDatePeriod,
  getYearOverYearDatePeriod,
} from "../model/date-periods"
import type { DashboardChartData } from "../model/analytics-types"
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
} from "../model/analytics"
import { unique } from "../model/collections"
import { ALL_RANGE } from "../model/constants"
import { dateKey } from "../model/date"
import { filterTransactions } from "../model/filtering"
import type { Filters, RateMap, Transaction } from "../model/types"

type DashboardAnalysisParams = {
  transactions: Transaction[]
  filters: Filters
  rates: RateMap
  drillCategory: string
  rankLevel: RankLevel
  summarySort: SummarySort
  tagSort: TagSort
  accountSort: AccountSort
  detailSort: DetailSort
  page: number
  pageSize: number
}

export function useDashboardAnalysis({
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
  const filteredDateRange = useMemo(() => getDateRange(filtered), [filtered])
  const currentPeriod = useMemo(
    () =>
      invalidDateRange
        ? null
        : getCurrentDatePeriod(filters, filtered, filteredDateRange),
    [filtered, filteredDateRange, filters, invalidDateRange]
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
  const accountSummary = useMemo(
    () =>
      summarizeBy(
        filtered.filter((tx) => tx.account1),
        rates,
        (tx) => tx.account1
      ),
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

  const detailRows = useMemo(
    () => sortDetailRows(filtered, detailSort, rates),
    [detailSort, filtered, rates]
  )
  const { totalPages, safePage, pagedRows } = useMemo(
    () => paginateRows(detailRows, page, pageSize),
    [detailRows, page, pageSize]
  )
  const expenseTotal = useMemo(
    () => categorySummary.reduce((sum, item) => sum + item.amount, 0) || 1,
    [categorySummary]
  )
  const rangeText = dateRange
    ? `${dateKey(dateRange.start)} → ${dateKey(dateRange.end)}`
    : "等待导入"
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
  const chartData = useMemo<DashboardChartData>(
    () => ({
      monthly,
      categoryPie,
      ranking,
      accountSummary,
      currencySummary,
      weekSummary,
      tagSummary,
      heatmap,
      dailyCashflow,
    }),
    [
      categoryPie,
      accountSummary,
      currencySummary,
      dailyCashflow,
      heatmap,
      monthly,
      ranking,
      tagSummary,
      weekSummary,
    ]
  )

  const sortedCategoryRows = useMemo(
    () => sortCategorySummaryRows(categorySummary, summarySort),
    [categorySummary, summarySort]
  )
  const sortedTagRows = useMemo(
    () => sortTagSummaryRows(tagSummary, tagSort),
    [tagSort, tagSummary]
  )
  const sortedAccountRows = useMemo(
    () => sortAccountSummaryRows(accountSummary, accountSort),
    [accountSort, accountSummary]
  )

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
    chartData,
    sortedCategoryRows,
    sortedTagRows,
    sortedAccountRows,
  }
}
