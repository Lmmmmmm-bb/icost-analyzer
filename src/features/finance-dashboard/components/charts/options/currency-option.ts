import type { EChartsOption } from "echarts"

import { CHART_COLORS } from "../chart-theme"
import type { SummaryItem } from "../../../model/analytics-types"
import type { ChartTheme } from "./types"
import {
  chartMutedTextColor,
  chartSoftEdgeColor,
  chartTextColor,
  pieLegend,
  tooltipStyle,
} from "./shared"

export function createCurrencyOption(
  items: SummaryItem[],
  theme?: ChartTheme
): EChartsOption {
  return {
    color: CHART_COLORS,
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
        data: items.map((item) => ({
          name: item.name,
          value: Number(item.amount.toFixed(2)),
        })),
        itemStyle: { borderColor: chartSoftEdgeColor(theme), borderWidth: 1 },
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
