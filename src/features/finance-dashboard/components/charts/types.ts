import type { EChartsOption } from "echarts"

export type ChartOptionFactory = () => EChartsOption

export type HeatmapColorScaleMode = "robust" | "full"

export type ChartPanelOptions = {
  monthlyOption: ChartOptionFactory
  pieOption: ChartOptionFactory
  rankingOption: ChartOptionFactory
  currencyOption: ChartOptionFactory
  weekOption: ChartOptionFactory
  tagOption: ChartOptionFactory
}
