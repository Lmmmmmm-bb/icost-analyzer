import type { EChartsOption } from "echarts"

export type RankLevel = "一级分类" | "二级分类"

export const RANK_LEVELS = [
  "一级分类",
  "二级分类",
] as const satisfies readonly RankLevel[]

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
}
