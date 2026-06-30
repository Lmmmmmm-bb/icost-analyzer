import type { EChartsOption } from "echarts"

import { pieChartTokenColors } from "../chart-theme"
import type { SummaryItem } from "../../../model/analytics-types"
import type { ChartTheme } from "./types"
import {
  chartMutedTextColor,
  chartSoftEdgeColor,
  chartTextColor,
  pieLegend,
  pieSeriesData,
  tooltipStyle,
} from "./shared"

export function createCurrencyOption(
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
        radius: ["42%", "66%"],
        center: ["50%", "43%"],
        data: pieSeriesData(items, colors, edgeColor),
        itemStyle: { borderColor: edgeColor, borderWidth: 1 },
        label: {
          show: true,
          position: "center",
          formatter: () => `{a|币种总数}\n{b|${items.length} 种}`,
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
