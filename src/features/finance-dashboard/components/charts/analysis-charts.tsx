import { useMemo, useState } from "react"

import { useTheme } from "@/components/theme-provider"

import type { DashboardChartData } from "../../model/analytics-types"
import { type RankLevel } from "../../model/dashboard-controls"
import {
  createCurrencyOption,
  createHeatmapOptionsByYear,
  createMonthlyOption,
  createPieOption,
  createRankingOption,
  createTagOption,
  createWeekOption,
} from "./chart-options"
import { CategoryAnalysisGrid } from "./category-analysis-grid"
import { DailyCashflowPanel } from "./daily-cashflow/daily-cashflow-panel"
import { DistributionChartsGrid } from "./distribution-charts-grid"
import { HeatmapPanel } from "./heatmap-panel"
import { MonthlyTrendPanel } from "./monthly-trend-panel"

type AnalysisChartsProps = {
  data: DashboardChartData
  drillCategory: string
  rankLevel: RankLevel
  onApplyMonth: (month: string) => void
  onDrillCategoryChange: (category: string) => void
  onRankLevelChange: (level: RankLevel) => void
  onTagSelect: (tag: string) => void
}

export function AnalysisCharts({
  data,
  drillCategory,
  rankLevel,
  onApplyMonth,
  onDrillCategoryChange,
  onRankLevelChange,
  onTagSelect,
}: AnalysisChartsProps) {
  const { resolvedTheme } = useTheme()
  const [reviewOpen, setReviewOpen] = useState(false)
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
    () => createHeatmapOptionsByYear(data.heatmap, resolvedTheme),
    [data.heatmap, resolvedTheme]
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

        <DistributionChartsGrid
          options={distributionOptions}
          onTagSelect={onTagSelect}
        />
      </div>

      <HeatmapPanel heatmapOptions={heatmapOptions} />
      <DailyCashflowPanel dailyCashflow={data.dailyCashflow} />
    </>
  )
}
