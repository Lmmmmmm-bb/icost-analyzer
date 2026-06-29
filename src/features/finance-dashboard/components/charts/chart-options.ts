import type { EChartsOption } from "echarts"

import {
  BALANCE_COLOR,
  CHART_COLORS,
  EXPENSE_COLOR,
  INCOME_COLOR,
  RANKING_COLOR,
  RANKING_COLOR_END,
  TAG_COLOR_ACTIVE,
  TAG_COLOR,
  WEEK_COLOR,
  WEEKEND_COLOR,
} from "./chart-theme"
import type {
  MonthlyItem,
  SummaryItem,
  WeekItem,
} from "../../model/analytics-types"
import { dateKey } from "../../model/date"
import { formatMoney } from "../../model/money"

type ChartTheme = "dark" | "light"

function isDarkChartTheme(theme?: ChartTheme) {
  return theme
    ? theme === "dark"
    : document.documentElement.classList.contains("dark")
}

function chartTextColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme) ? "#fafafa" : "#171717"
}

function chartMutedTextColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme) ? "#a3a3a3" : "#737373"
}

function chartSurfaceColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme) ? "#262626" : "#ffffff"
}

function chartSoftEdgeColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme)
    ? "rgba(250, 250, 250, 0.08)"
    : "rgba(255, 255, 255, 0.72)"
}

function chartHairlineColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme)
    ? "rgba(250, 250, 250, 0.05)"
    : "rgba(255, 255, 255, 0.48)"
}

function shadcnHeatmapColors(theme?: ChartTheme) {
  const isDark = isDarkChartTheme(theme)

  return isDark
    ? ["#262626", "#404040", "#737373", "#d4d4d4", "#e5e5e5"]
    : ["#fafafa", "#e5e5e5", "#a3a3a3", "#525252", "#262626"]
}

function axisStyle(theme?: ChartTheme) {
  return {
    axisLabel: { color: chartMutedTextColor(theme), fontSize: 11 },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: {
        color: "rgba(148, 163, 184, 0.16)",
      },
    },
  }
}

function compactMoney(value: number) {
  const abs = Math.abs(value)
  if (abs >= 10000) return `¥${Math.round(value / 10000)}万`
  if (abs >= 1000) return `¥${Math.round(value / 1000)}k`
  return `¥${Math.round(value)}`
}

function horizontalGradient(from: string, to: string) {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  }
}

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

function tooltipStyle(theme?: ChartTheme) {
  return {
    backgroundColor: chartSurfaceColor(theme),
    borderColor: "rgba(148, 163, 184, 0.28)",
    borderWidth: 1,
    textStyle: { color: chartTextColor(theme), fontSize: 12 },
    extraCssText: "box-shadow: 0 12px 32px rgb(0 0 0 / 0.12);",
  }
}

function pieLegend(items: SummaryItem[], theme?: ChartTheme) {
  return {
    type: "scroll" as const,
    bottom: 0,
    left: "center",
    icon: "circle",
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 10,
    pageIconSize: 9,
    pageTextStyle: { color: chartMutedTextColor(theme), fontSize: 10 },
    textStyle: {
      color: chartMutedTextColor(theme),
      fontSize: 10,
      width: 72,
      overflow: "truncate" as const,
    },
    data: items.map((item) => item.name),
  }
}

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

export function createPieOption(
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
        radius: ["44%", "68%"],
        center: ["50%", "43%"],
        padAngle: 1,
        data: items.map((item) => ({
          name: item.name,
          value: Number(item.amount.toFixed(2)),
        })),
        itemStyle: { borderColor: chartSoftEdgeColor(theme), borderWidth: 1 },
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

export function createRankingOption(
  items: SummaryItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  return {
    color: [RANKING_COLOR],
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
          color: horizontalGradient(RANKING_COLOR, RANKING_COLOR_END),
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

export function createTagOption(
  items: SummaryItem[],
  theme?: ChartTheme
): EChartsOption {
  const axis = axisStyle(theme)
  const top = items.slice(0, 15)
  return {
    color: [TAG_COLOR],
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
              color: horizontalGradient(TAG_COLOR, TAG_COLOR_ACTIVE),
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
  theme?: ChartTheme
) {
  const maxValue = Math.max(...heatmap.map((item) => item[1]), 1)
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
          maxValue
        ),
      },
    ]
  }

  return Array.from(groups.entries()).map(([year, items]) => ({
    year,
    option: createHeatmapOption(
      fillYearHeatmap(year, items),
      theme,
      year,
      maxValue
    ),
  }))
}
