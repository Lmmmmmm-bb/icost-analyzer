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

export function createTagOption(
  items: SummaryItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  const top = items.slice(0, 15)
  const tagColor = chartTokenColor(4)

  return {
    color: [tagColor],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatMoney(Number(value)),
      ...tooltipStyle(theme),
    },
    grid: { left: 6, right: 58, top: 6, bottom: 6, containLabel: true },
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
      data: top.map((item) => item.name).reverse(),
      ...axis,
      splitLine: { show: false },
      axisLabel: {
        color: chartMutedTextColor(theme),
        fontSize: 10,
        formatter: (value: string) =>
          value.length > 10 ? `${value.slice(0, 10)}…` : value,
      },
    },
    series: [
      {
        type: "bar",
        data: top
          .map((item) => ({
            value: item.amount,
            itemStyle: {
              color: tagColor,
            },
            emphasis: {
              itemStyle: {
                color: tagColor,
                opacity: 1,
              },
            },
          }))
          .reverse(),
        barMaxWidth: 12,
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
