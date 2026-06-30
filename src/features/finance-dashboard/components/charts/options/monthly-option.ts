import type { EChartsOption } from "echarts"

import { chartTokenColor } from "../chart-theme"
import type { MonthlyItem } from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"
import type { ChartTheme } from "./types"
import {
  axisStyle,
  chartMutedTextColor,
  compactMoney,
  fixedItemVisualStyle,
  fixedLineVisualStyle,
  tooltipStyle,
} from "./shared"

export function createMonthlyOption(
  monthly: MonthlyItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  const expenseColor = chartTokenColor(4)
  const incomeColor = chartTokenColor(2)
  const balanceColor = chartTokenColor(3)

  return {
    color: [expenseColor, incomeColor, balanceColor],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatMoney(Number(value)),
      ...tooltipStyle(theme),
    },
    legend: {
      top: 2,
      right: 0,
      icon: "rect",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 13,
      textStyle: { color: chartMutedTextColor(theme), fontSize: 11 },
    },
    grid: { left: 8, right: 14, top: 34, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: monthly.map((item) => item.month),
      ...axis,
      axisLabel: {
        color: chartMutedTextColor(theme),
        fontSize: 10,
        rotate: monthly.length > 16 ? 45 : 0,
        formatter: (value: string) => value.slice(2),
      },
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
        name: "支出",
        type: "bar",
        data: monthly.map((item) => item.expense),
        barMaxWidth: 28,
        ...fixedItemVisualStyle({ color: expenseColor }),
      },
      {
        name: "收入",
        type: "bar",
        data: monthly.map((item) => item.income),
        barMaxWidth: 28,
        ...fixedItemVisualStyle({ color: incomeColor }),
      },
      {
        name: "净结余",
        type: "line",
        data: monthly.map((item) => item.net),
        smooth: true,
        showSymbol: false,
        symbol: "none",
        ...fixedLineVisualStyle(balanceColor, 3),
        areaStyle: { color: balanceColor, opacity: 0.08 },
      },
    ],
  }
}
