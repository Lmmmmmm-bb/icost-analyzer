import type { EChartsOption } from "echarts"

export type HeatmapChartOption = {
  year: string
  option: EChartsOption
  cappedDays: number
  colorMaxValue: number
  actualMaxValue: number
}

export type HeatmapColorScaleMode = "robust" | "full"

export type ChartPanelOptions = {
  monthlyOption: EChartsOption
  pieOption: EChartsOption
  rankingOption: EChartsOption
  currencyOption: EChartsOption
  weekOption: EChartsOption
  tagOption: EChartsOption
  heatmapOptions: HeatmapChartOption[]
}
