import { useMemo } from "react"

import { RANK_LEVELS } from "../model/dashboard-controls"
import {
  paginateRows,
  sortAccountSummaryRows,
  sortCategorySummaryRows,
  sortDetailRows,
  sortTagSummaryRows,
} from "../model/dashboard-rows"
import type { DashboardViewState } from "../model/dashboard-state"
import { dateKey } from "../model/date"
import { summarizeBy } from "../model/analytics"
import type { RateMap } from "../model/types"
import {
  selectDayDetails,
  selectMonthDetails,
  selectMonthlyReview,
  type TransactionDetailQueries,
} from "../model/transaction-details"
import type { DashboardAnalysis } from "./use-dashboard-analysis"
import type { DashboardChartData } from "./dashboard-view-types"

type DashboardViewModelParams = {
  analysis: DashboardAnalysis
  view: DashboardViewState
  rates: RateMap
}

export function useDashboardViewModel({
  analysis,
  view,
  rates,
}: DashboardViewModelParams) {
  const {
    filtered,
    dateRange,
    monthly,
    categorySummary,
    subcategorySummary,
    accountSummary,
    currencySummary,
    weekSummary,
    tagSummary,
    heatmap,
    dailyCashflow,
  } = analysis
  const {
    drillCategory,
    rankLevel,
    summarySort,
    tagSort,
    accountSort,
    detailSort,
    page,
    pageSize,
  } = view
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

  const detailQueries = useMemo<TransactionDetailQueries>(
    () => ({
      monthlyReview: () => selectMonthlyReview(filtered, rates, monthly),
      month: (month) => selectMonthDetails(filtered, rates, month),
      day: (day) => selectDayDetails(filtered, rates, day),
    }),
    [filtered, rates, monthly]
  )

  return {
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
    detailQueries,
  }
}
