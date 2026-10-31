import { useMemo } from "react"

import {
  getCurrentDatePeriod,
  getPreviousDatePeriod,
  getYearOverYearDatePeriod,
} from "../model/date-periods"
import {
  getDailySummary,
  getDateRange,
  getDimensions,
  getHeatmap,
  getMonthlySummary,
  getPeriodComparison,
  getStats,
  getWeekSummary,
  summarizeBy,
} from "../model/analytics"
import { customTime } from "../model/filters"
import { resolveTimeFilter } from "../model/time-filter"
import { dateKey } from "../model/date"
import { filterTransactions } from "../model/filtering"
import { getMissingRates } from "../model/money"
import type { Filters, RateMap, Transaction } from "../model/types"
import type { TransactionSearchIndex } from "@/features/finance-dashboard/model/transaction-search"

type DashboardAnalysisParams = {
  transactions: Transaction[]
  filters: Filters
  rates: RateMap
  asOf: string
  searchIndex: TransactionSearchIndex
}

export function useDashboardAnalysis({
  transactions,
  filters,
  rates,
  asOf,
  searchIndex,
}: DashboardAnalysisParams) {
  const dimensions = useMemo(() => getDimensions(transactions), [transactions])
  const dateRange = useMemo(() => getDateRange(transactions), [transactions])
  const now = useMemo(() => new Date(asOf), [asOf])
  const bounds = useMemo(
    () => resolveTimeFilter(filters.time, now),
    [filters.time, now]
  )
  const invalidDateRange = !bounds.valid
  const filtered = useMemo(
    () => filterTransactions(transactions, filters, now, bounds, searchIndex),
    [filters, bounds, now, transactions, searchIndex]
  )
  const filteredDateRange = useMemo(() => getDateRange(filtered), [filtered])
  const currentPeriod = useMemo(
    () => getCurrentDatePeriod(bounds, filteredDateRange),
    [bounds, filteredDateRange]
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
        time: customTime(
          dateKey(previousPeriod.start),
          dateKey(previousPeriod.end)
        ),
      },
      now,
      undefined,
      searchIndex
    )
  }, [
    filters,
    invalidDateRange,
    previousPeriod,
    transactions,
    now,
    searchIndex,
  ])
  const yearOverYearScope = useMemo(() => {
    if (!yearOverYearPeriod) return []
    if (invalidDateRange) return []
    return filterTransactions(
      transactions,
      {
        ...filters,
        time: customTime(
          dateKey(yearOverYearPeriod.start),
          dateKey(yearOverYearPeriod.end)
        ),
      },
      now,
      undefined,
      searchIndex
    )
  }, [
    filters,
    invalidDateRange,
    transactions,
    yearOverYearPeriod,
    now,
    searchIndex,
  ])
  const missingRates = useMemo(
    () => getMissingRates(filtered, rates),
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
  const monthly = useMemo(
    () => getMonthlySummary(filtered, rates),
    [filtered, rates]
  )
  const categorySummary = useMemo(
    () => summarizeBy(filtered, rates, (tx) => tx.category),
    [filtered, rates]
  )
  const subcategorySummary = useMemo(
    () => summarizeBy(filtered, rates, (tx) => tx.subcategory),
    [filtered, rates]
  )
  const tagSummary = useMemo(
    () => summarizeBy(filtered, rates, (tx) => tx.tags),
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
    () => getDailySummary(filtered, rates),
    [filtered, rates]
  )
  const heatmap = useMemo(() => getHeatmap(filtered, rates), [filtered, rates])

  return {
    dimensions,
    dateRange,
    invalidDateRange,
    filtered,
    missingRates,
    stats,
    periodComparison,
    yearComparison,
    monthly,
    categorySummary,
    subcategorySummary,
    tagSummary,
    currencySummary,
    accountSummary,
    weekSummary,
    dailyCashflow,
    heatmap,
  }
}

export type DashboardAnalysis = ReturnType<typeof useDashboardAnalysis>
