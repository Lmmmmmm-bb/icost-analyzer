import type { EChartsOption } from "echarts"

import { BALANCE_COLOR, EXPENSE_COLOR, INCOME_COLOR } from "../chart-theme"
import type { MonthlyItem } from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"
import type { ChartTheme } from "./types"
import {
  axisStyle,
  chartMutedTextColor,
  compactMoney,
  tooltipStyle,
} from "./shared"

export function createMonthlyOption(
  monthly: MonthlyItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  return {
    color: [EXPENSE_COLOR, INCOME_COLOR, BALANCE_COLOR],
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
      },
      {
        name: "收入",
        type: "bar",
        data: monthly.map((item) => item.income),
        barMaxWidth: 28,
      },
      {
        name: "净结余",
        type: "line",
        data: monthly.map((item) => item.net),
        smooth: true,
        showSymbol: false,
        symbol: "none",
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.08 },
      },
    ],
  }
}
