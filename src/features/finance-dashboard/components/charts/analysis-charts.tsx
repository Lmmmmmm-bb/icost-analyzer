import { useMemo, useState } from "react"

import { useTheme } from "@/components/theme-provider"

import type {
  DashboardChartData,
  SummaryItem,
} from "../../model/analytics-types"
import {
  type AccountSort,
  type RankLevel,
} from "../../model/dashboard-controls"
import {
  createCurrencyOption,
  createHeatmapOptionsByYear,
  createMonthlyOption,
  createPieOption,
  createRankingOption,
  createTagOption,
  createWeekOption,
} from "./chart-options"
import { AccountAnalysisGrid } from "./account-analysis-grid"
import { CategoryAnalysisGrid } from "./category-analysis-grid"
import { DailyCashflowPanel } from "./daily-cashflow/daily-cashflow-panel"
import { DistributionChartsGrid } from "./distribution-charts-grid"
import { HeatmapPanel } from "./heatmap-panel"
import { MonthlyTrendPanel } from "./monthly-trend-panel"
import type { HeatmapColorScaleMode } from "./types"

type AnalysisChartsProps = {
  data: DashboardChartData
  accountRows: SummaryItem[]
  drillCategory: string
  rankLevel: RankLevel
  accountSort: AccountSort
  onApplyMonth: (month: string) => void
  onDrillCategoryChange: (category: string) => void
  onRankLevelChange: (level: RankLevel) => void
  onAccountSortChange: (sort: AccountSort) => void
  onAccountSelect: (account: string) => void
  onTagSelect: (tag: string) => void
}

export function AnalysisCharts({
  data,
  accountRows,
  drillCategory,
  rankLevel,
  accountSort,
  onApplyMonth,
  onDrillCategoryChange,
  onRankLevelChange,
  onAccountSortChange,
  onAccountSelect,
  onTagSelect,
}: AnalysisChartsProps) {
  const { resolvedTheme } = useTheme()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [heatmapScaleMode, setHeatmapScaleMode] =
    useState<HeatmapColorScaleMode>("robust")
  const monthlyOption = useMemo(
    () => createMonthlyOption(data.monthly, resolvedTheme),
    [data.monthly, resolvedTheme]
  )
  const pieOption = useMemo(
    () => createPieOption(data.categoryPie, resolvedTheme),
    [data.categoryPie, resolvedTheme]
  )
  const rankingOption = useMemo(
    () => createRankingOption(data.ranking, resolvedTheme),
    [data.ranking, resolvedTheme]
  )
  const accountOption = useMemo(
    () => createPieOption(data.accountSummary, resolvedTheme),
    [data.accountSummary, resolvedTheme]
  )
  const currencyOption = useMemo(
    () => createCurrencyOption(data.currencySummary, resolvedTheme),
    [data.currencySummary, resolvedTheme]
  )
  const weekOption = useMemo(
    () => createWeekOption(data.weekSummary, resolvedTheme),
    [data.weekSummary, resolvedTheme]
  )
  const tagOption = useMemo(
    () => createTagOption(data.tagSummary, resolvedTheme),
    [data.tagSummary, resolvedTheme]
  )
  const heatmapOptions = useMemo(
    () =>
      createHeatmapOptionsByYear(data.heatmap, resolvedTheme, heatmapScaleMode),
    [data.heatmap, heatmapScaleMode, resolvedTheme]
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
          monthlyReview={data.monthly}
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
            onSortChange={onAccountSortChange}
            onAccountSelect={onAccountSelect}
          />
        ) : null}

        <DistributionChartsGrid
          options={distributionOptions}
          onTagSelect={onTagSelect}
        />
      </div>

      <HeatmapPanel
        heatmapOptions={heatmapOptions}
        scaleMode={heatmapScaleMode}
        onScaleModeChange={setHeatmapScaleMode}
      />
      <DailyCashflowPanel dailyCashflow={data.dailyCashflow} />
    </>
  )
}
