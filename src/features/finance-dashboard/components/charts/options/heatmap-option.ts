import type { EChartsOption } from "echarts"

import { dateKey } from "../../../model/date"
import { formatMoney } from "../../../model/money"
import type { ChartTheme } from "./types"
import {
  chartHairlineColor,
  chartMutedTextColor,
  chartSurfaceColor,
  shadcnHeatmapColors,
  tooltipStyle,
} from "./shared"

export function createHeatmapOption(
  heatmap: [string, number][],
  theme?: ChartTheme,
  rangeYear?: string,
  maxValue?: number
): EChartsOption {
  const heatmapRange = rangeYear
    ? rangeYear
    : heatmap.length
      ? [heatmap[0][0], heatmap[heatmap.length - 1][0]]
      : [dateKey(new Date()), dateKey(new Date())]
  return {
    tooltip: {
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params
        const value = item?.value as [string, number] | undefined
        return `${value?.[0] ?? ""}<br/>${formatMoney(value?.[1] ?? 0)}`
      },
      ...tooltipStyle(theme),
    },
    visualMap: {
      show: false,
      min: 0,
      max: maxValue ?? Math.max(...heatmap.map((item) => item[1]), 1),
      inRange: { color: shadcnHeatmapColors(theme) },
    },
    calendar: {
      top: 36,
      left: 36,
      right: 24,
      cellSize: [16, 16],
      range: heatmapRange,
      splitLine: { lineStyle: { color: chartHairlineColor(theme) } },
      itemStyle: {
        color: chartSurfaceColor(theme),
        borderColor: chartHairlineColor(theme),
        borderWidth: 1,
      },
      dayLabel: { color: chartMutedTextColor(theme) },
      monthLabel: { color: chartMutedTextColor(theme) },
      yearLabel: { show: false },
    },
    series: [{ type: "heatmap", coordinateSystem: "calendar", data: heatmap }],
  }
}
