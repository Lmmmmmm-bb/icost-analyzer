import type { EChartsOption } from "echarts"

import { dateKey } from "../../../model/date"
import { formatMoney } from "../../../model/money"
import type { HeatmapColorScaleMode } from "../types"
import type { ChartTheme } from "./types"
import {
  chartHairlineColor,
  chartMutedTextColor,
  chartSurfaceColor,
  shadcnHeatmapColors,
  tooltipStyle,
} from "./shared"

function daysInYear(year: string) {
  const days: string[] = []
  const date = new Date(Number(year), 0, 1)
  while (date.getFullYear() === Number(year)) {
    days.push(dateKey(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

function fillYearHeatmap(year: string, heatmap: [string, number][]) {
  const valueByDate = new Map(heatmap)
  return daysInYear(year).map(
    (day) => [day, valueByDate.get(day) ?? 0] as [string, number]
  )
}

function getPercentile(values: number[], percentile: number) {
  if (!values.length) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(
    sorted.length - 1,
    Math.floor((sorted.length - 1) * percentile)
  )
  return sorted[index]
}

function getHeatmapScaleValues(
  heatmap: [string, number][],
  scaleMode: HeatmapColorScaleMode
) {
  const values = heatmap.map((item) => item[1]).filter((value) => value > 0)
  const actualMaxValue = Math.max(...values, 1)
  const robustMaxValue = getPercentile(values, 0.95)
  const colorMaxValue =
    scaleMode === "robust" && robustMaxValue > 0
      ? Math.min(robustMaxValue, actualMaxValue)
      : actualMaxValue

  return {
    actualMaxValue,
    colorMaxValue,
    cappedDays: values.filter((value) => value > colorMaxValue).length,
  }
}

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

export function createHeatmapOptionsByYear(
  heatmap: [string, number][],
  theme?: ChartTheme,
  scaleMode: HeatmapColorScaleMode = "robust"
) {
  const { actualMaxValue, cappedDays, colorMaxValue } = getHeatmapScaleValues(
    heatmap,
    scaleMode
  )
  const groups = heatmap.reduce((map, item) => {
    const year = item[0].slice(0, 4)
    const group = map.get(year) ?? []
    group.push(item)
    map.set(year, group)
    return map
  }, new Map<string, [string, number][]>())

  if (!groups.size) {
    const year = String(new Date().getFullYear())
    return [
      {
        year,
        option: createHeatmapOption(
          fillYearHeatmap(year, []),
          theme,
          year,
          colorMaxValue
        ),
        cappedDays,
        colorMaxValue,
        actualMaxValue,
      },
    ]
  }

  return Array.from(groups.entries()).map(([year, items]) => ({
    year,
    option: createHeatmapOption(
      fillYearHeatmap(year, items),
      theme,
      year,
      colorMaxValue
    ),
    cappedDays: items.filter((item) => item[1] > colorMaxValue).length,
    colorMaxValue,
    actualMaxValue,
  }))
}
