import type { EChartsOption } from "echarts"

import { pieChartTokenColors } from "../chart-theme"
import type { SummaryItem } from "../../../model/analytics-types"
import type { ChartTheme } from "./types"
import {
  chartMutedTextColor,
  chartSoftEdgeColor,
  chartTextColor,
  compactMoney,
  pieLegend,
  pieSeriesData,
  tooltipStyle,
} from "./shared"

export function createPieOption(
  items: SummaryItem[],
  theme?: ChartTheme
): EChartsOption {
  const colors = pieChartTokenColors()
  const edgeColor = chartSoftEdgeColor(theme)

  return {
    color: colors,
    tooltip: {
      trigger: "item",
      formatter: "{b}<br/>¥{c} · {d}%",
      ...tooltipStyle(theme),
    },
    legend: pieLegend(items, theme),
    series: [
      {
        type: "pie",
        radius: ["44%", "68%"],
        center: ["50%", "43%"],
        padAngle: 1,
        data: pieSeriesData(items, colors, edgeColor),
        itemStyle: { borderColor: edgeColor, borderWidth: 1 },
        label: {
          show: true,
          position: "center",
          formatter: () =>
            `{a|支出合计}\n{b|${compactMoney(items.reduce((sum, item) => sum + item.amount, 0))}}`,
          rich: {
            a: {
              color: chartMutedTextColor(theme),
              fontSize: 11,
              padding: [0, 0, 5, 0],
            },
            b: { color: chartTextColor(theme), fontSize: 18, fontWeight: 600 },
          },
        },
        labelLine: { show: false },
      },
    ],
  }
}
