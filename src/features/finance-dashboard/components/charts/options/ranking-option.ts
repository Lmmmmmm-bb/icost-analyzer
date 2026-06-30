import type { EChartsOption } from "echarts"

import { chartTokenColor } from "../chart-theme"
import type { SummaryItem } from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"
import type { ChartTheme } from "./types"
import {
  axisStyle,
  chartMutedTextColor,
  compactMoney,
  tooltipStyle,
} from "./shared"

export function createRankingOption(
  items: SummaryItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  const rankingColor = chartTokenColor(3)

  return {
    color: [rankingColor],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatMoney(Number(value)),
      ...tooltipStyle(theme),
    },
    grid: { left: 8, right: 62, top: 8, bottom: 6, containLabel: true },
    xAxis: {
      type: "value",
      ...axis,
      axisLabel: {
        color: chartMutedTextColor(theme),
        fontSize: 10,
        formatter: compactMoney,
      },
    },
    yAxis: {
      type: "category",
      data: items.map((item) => item.name).reverse(),
      ...axis,
      splitLine: { show: false },
      axisLabel: {
        color: chartMutedTextColor(theme),
        fontSize: 11,
        formatter: (value: string) =>
          value.length > 10 ? `${value.slice(0, 10)}…` : value,
      },
    },
    series: [
      {
        type: "bar",
        data: items.map((item) => item.amount).reverse(),
        barMaxWidth: 13,
        itemStyle: {
          color: rankingColor,
        },
        emphasis: {
          itemStyle: {
            color: rankingColor,
            opacity: 1,
          },
        },
        label: {
          show: true,
          position: "right",
          color: chartMutedTextColor(theme),
          fontSize: 10,
          formatter: (params) => formatMoney(Number(params.value)),
        },
      },
    ],
  }
}
