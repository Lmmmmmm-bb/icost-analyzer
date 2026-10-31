import { useCallback, useMemo, useState } from "react"

import { useTheme } from "@/components/theme-provider"

import type { SummaryItem } from "../../model/analytics-types"
import type { DashboardChartData } from "../../hooks/dashboard-view-types"
import type { TransactionDetailQueries } from "../../model/transaction-details"
import {
  type AccountSort,
  type RankLevel,
} from "../../model/dashboard-controls"
import {
  createCurrencyOption,
  createMonthlyOption,
  createPieOption,
  createRankingOption,
  createTagOption,
  createWeekOption,
} from "./chart-options"
import { createHeatmapYears } from "@/features/finance-dashboard/components/charts/options/heatmap-data"
import { AccountAnalysisGrid } from "./account-analysis-grid"
import { CategoryAnalysisGrid } from "./category-analysis-grid"
import { DailyCashflowPanel } from "./daily-cashflow/daily-cashflow-panel"
import { DistributionChartsGrid } from "./distribution-charts-grid"
import { HeatmapPanel } from "./heatmap-panel"
import { MonthlyTrendPanel } from "./monthly-trend-panel"
import type { HeatmapColorScaleMode } from "./types"

type AnalysisChartsProps = {
  data: DashboardChartData
  detailQueries: TransactionDetailQueries
  accountRows: SummaryItem[]
  drillCategory: string
  rankLevel: RankLevel
  accountSort: AccountSort
  activeAccounts: string[]
  onApplyMonth: (month: string) => void
  onDrillCategoryChange: (category: string) => void
  onRankLevelChange: (level: RankLevel) => void
  onAccountSortChange: (sort: AccountSort) => void
  onAccountSelect: (account: string) => void
  onResetAccounts: () => void
  onTagSelect: (tag: string) => void
}

export function AnalysisCharts({
  data,
  detailQueries,
  accountRows,
  drillCategory,
  rankLevel,
  accountSort,
  activeAccounts,
  onApplyMonth,
  onDrillCategoryChange,
  onRankLevelChange,
  onAccountSortChange,
  onAccountSelect,
  onResetAccounts,
  onTagSelect,
}: AnalysisChartsProps) {
  const { resolvedTheme } = useTheme()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [heatmapScaleMode, setHeatmapScaleMode] =
    useState<HeatmapColorScaleMode>("robust")
  const monthlyOption = useCallback(
    () => createMonthlyOption(data.monthly, resolvedTheme),
    [data.monthly, resolvedTheme]
  )
  const pieOption = useCallback(
    () => createPieOption(data.categoryPie, resolvedTheme),
    [data.categoryPie, resolvedTheme]
  )
  const rankingOption = useCallback(
    () => createRankingOption(data.ranking, resolvedTheme),
    [data.ranking, resolvedTheme]
  )
  const accountOption = useCallback(
    () => createPieOption(data.accountSummary, resolvedTheme),
    [data.accountSummary, resolvedTheme]
  )
  const currencyOption = useCallback(
    () => createCurrencyOption(data.currencySummary, resolvedTheme),
    [data.currencySummary, resolvedTheme]
  )
  const weekOption = useCallback(
    () => createWeekOption(data.weekSummary, resolvedTheme),
    [data.weekSummary, resolvedTheme]
  )
  const tagOption = useCallback(
    () => createTagOption(data.tagSummary, resolvedTheme),
    [data.tagSummary, resolvedTheme]
  )
  const heatmapYears = useMemo(
    () =>
      createHeatmapYears(
        data.heatmap,
        heatmapScaleMode,
        String(new Date().getFullYear())
      ),
    [data.heatmap, heatmapScaleMode]
  )
  const categoryOptions = useMemo(
    () => ({ pieOption, rankingOption }),
    [pieOption, rankingOption]
  )
  const distributionOptions = useMemo(
    () => ({ currencyOption, weekOption, tagOption }),
    [currencyOption, tagOption, weekOption]
  )

  return (
    <>
      <div className="grid gap-6">
        <MonthlyTrendPanel
          option={monthlyOption}
          detailQueries={detailQueries}
          reviewOpen={reviewOpen}
          onReviewOpenChange={setReviewOpen}
          onApplyMonth={onApplyMonth}
        />

        <CategoryAnalysisGrid
          options={categoryOptions}
          drillCategory={drillCategory}
          rankLevel={rankLevel}
          onDrillCategoryChange={onDrillCategoryChange}
          onRankLevelChange={onRankLevelChange}
        />

        {data.accountSummary.length ? (
          <AccountAnalysisGrid
            option={accountOption}
            rows={accountRows}
            sort={accountSort}
            activeAccounts={activeAccounts}
            onSortChange={onAccountSortChange}
            onAccountSelect={onAccountSelect}
            onResetAccounts={onResetAccounts}
          />
        ) : null}

        <DistributionChartsGrid
          options={distributionOptions}
          onTagSelect={onTagSelect}
        />
      </div>

      <HeatmapPanel
        years={heatmapYears}
        scaleMode={heatmapScaleMode}
        onScaleModeChange={setHeatmapScaleMode}
      />
      <DailyCashflowPanel
        dailyCashflow={data.dailyCashflow}
        selectDetails={detailQueries.day}
      />
    </>
  )
}
