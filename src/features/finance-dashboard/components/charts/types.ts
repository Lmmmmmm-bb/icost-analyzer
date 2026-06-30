import type { EChartsOption } from "echarts"

import type {
  DailyCashflowItem,
  MonthlyItem,
} from "../../model/analytics-types"

export type HeatmapChartOption = {
  year: string
  option: EChartsOption
}

export type ChartOptions = {
  monthlyOption: EChartsOption
  pieOption: EChartsOption
  rankingOption: EChartsOption
  currencyOption: EChartsOption
  weekOption: EChartsOption
  tagOption: EChartsOption
  heatmapOptions: HeatmapChartOption[]
  dailyCashflow: DailyCashflowItem[]
  monthlyReview: MonthlyItem[]
}
