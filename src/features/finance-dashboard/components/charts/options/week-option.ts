import type { EChartsOption } from "echarts"

import { WEEK_COLOR, WEEKEND_COLOR } from "../chart-theme"
import type { WeekItem } from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"
import type { ChartTheme } from "./types"
import {
  axisStyle,
  chartMutedTextColor,
  compactMoney,
  tooltipStyle,
} from "./shared"

export function createWeekOption(
  items: WeekItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  return {
    color: [WEEK_COLOR],
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
        data: items.map((item, index) => ({
          value: item.amount,
          itemStyle: {
            color: [5, 6].includes(index) ? WEEKEND_COLOR : WEEK_COLOR,
            borderColor: WEEKEND_COLOR,
            borderWidth: [5, 6].includes(index) ? 0 : 1,
          },
        })),
        barMaxWidth: 34,
      },
    ],
  }
}
