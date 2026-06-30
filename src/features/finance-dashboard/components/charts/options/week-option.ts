import type { EChartsOption } from "echarts"

import { chartTokenColor } from "../chart-theme"
import type { WeekItem } from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"
import type { ChartTheme } from "./types"
import {
  axisStyle,
  chartMutedTextColor,
  compactMoney,
  fixedItemVisualStyle,
  tooltipStyle,
} from "./shared"

export function createWeekOption(
  items: WeekItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  const weekColor = chartTokenColor(1)
  const weekendColor = chartTokenColor(3)

  return {
    color: [weekColor],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatMoney(Number(value)),
      ...tooltipStyle(theme),
    },
    grid: { left: 6, right: 10, top: 12, bottom: 6, containLabel: true },
    xAxis: {
      type: "category",
      data: items.map((item) => item.name),
      ...axis,
      axisLabel: { color: chartMutedTextColor(theme), fontSize: 11 },
    },
    yAxis: {
      type: "value",
      ...axis,
      axisLabel: {
        color: chartMutedTextColor(theme),
        fontSize: 10,
        formatter: compactMoney,
      },
    },
    series: [
      {
        type: "bar",
        data: items.map((item, index) => {
          const isWeekend = [5, 6].includes(index)
          const color = isWeekend ? weekendColor : weekColor
          const opacity = isWeekend ? 1 : 0.68
          const borderWidth = isWeekend ? 0 : 1

          return {
            value: item.amount,
            ...fixedItemVisualStyle({
              color,
              opacity,
              borderColor: weekendColor,
              borderWidth,
            }),
          }
        }),
        barMaxWidth: 34,
      },
    ],
  }
}
