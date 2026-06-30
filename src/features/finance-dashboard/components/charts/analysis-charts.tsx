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
  const options = useMemo(
    () => ({
      monthlyOption: createMonthlyOption(data.monthly, resolvedTheme),
      pieOption: createPieOption(data.categoryPie, resolvedTheme),
      rankingOption: createRankingOption(data.ranking, resolvedTheme),
      currencyOption: createCurrencyOption(data.currencySummary, resolvedTheme),
      weekOption: createWeekOption(data.weekSummary, resolvedTheme),
      tagOption: createTagOption(data.tagSummary, resolvedTheme),
      heatmapOptions: createHeatmapOptionsByYear(data.heatmap, resolvedTheme),
    }),
    [data, resolvedTheme]
  )

  return (
    <>
      <div className="grid gap-6">
        <MonthlyTrendPanel
          option={options.monthlyOption}
          monthlyReview={data.monthly}
          reviewOpen={reviewOpen}
          onReviewOpenChange={setReviewOpen}
          onApplyMonth={onApplyMonth}
        />

        <CategoryAnalysisGrid
          options={options}
          drillCategory={drillCategory}
          rankLevel={rankLevel}
          onDrillCategoryChange={onDrillCategoryChange}
          onRankLevelChange={onRankLevelChange}
        />

        <DistributionChartsGrid options={options} onTagSelect={onTagSelect} />
      </div>

      <HeatmapPanel heatmapOptions={options.heatmapOptions} />
      <DailyCashflowPanel dailyCashflow={data.dailyCashflow} />
    </>
  )
}
