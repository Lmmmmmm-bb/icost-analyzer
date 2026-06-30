import type { SummaryItem } from "../../../model/analytics-types"

import type { ChartTheme } from "./types"

function isDarkChartTheme(theme?: ChartTheme) {
  return theme
    ? theme === "dark"
    : document.documentElement.classList.contains("dark")
}

export function chartTextColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme) ? "#fafafa" : "#171717"
}

export function chartMutedTextColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme) ? "#a3a3a3" : "#737373"
}

export function chartSurfaceColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme) ? "#262626" : "#ffffff"
}

export function chartSoftEdgeColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme)
    ? "rgba(250, 250, 250, 0.08)"
    : "rgba(255, 255, 255, 0.72)"
}

export function chartHairlineColor(theme?: ChartTheme) {
  return isDarkChartTheme(theme)
    ? "rgba(250, 250, 250, 0.05)"
    : "rgba(255, 255, 255, 0.48)"
}

export function shadcnHeatmapColors(theme?: ChartTheme) {
  const isDark = isDarkChartTheme(theme)

  return isDark
    ? ["#262626", "#404040", "#737373", "#d4d4d4", "#e5e5e5"]
    : ["#fafafa", "#e5e5e5", "#a3a3a3", "#525252", "#262626"]
}

export function axisStyle(theme?: ChartTheme) {
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

export function compactMoney(value: number) {
  const abs = Math.abs(value)
  if (abs >= 10000) return `¥${Math.round(value / 10000)}万`
  if (abs >= 1000) return `¥${Math.round(value / 1000)}k`
  return `¥${Math.round(value)}`
}

type FixedItemVisualStyle = {
  color: string
  opacity?: number
  borderColor?: string
  borderWidth?: number
}

export function fixedItemVisualStyle(style: FixedItemVisualStyle) {
  return {
    itemStyle: style,
    emphasis: {
      itemStyle: {
        ...style,
        opacity: style.opacity ?? 1,
      },
    },
  }
}

export function fixedLineVisualStyle(color: string, width: number) {
  return {
    itemStyle: { color },
    lineStyle: { color, width },
    emphasis: {
      itemStyle: { color, opacity: 1 },
      lineStyle: { color, width },
    },
  }
}

export function pieSeriesData(
  items: SummaryItem[],
  colors: string[],
  edgeColor: string
) {
  return items.map((item, index) => {
    const color = colors[index % colors.length]

    return {
      name: item.name,
      value: Number(item.amount.toFixed(2)),
      ...fixedItemVisualStyle({
        color,
        borderColor: edgeColor,
        borderWidth: 1,
      }),
    }
  })
}

export function tooltipStyle(theme?: ChartTheme) {
  return {
    backgroundColor: chartSurfaceColor(theme),
    borderColor: "rgba(148, 163, 184, 0.28)",
    borderWidth: 1,
    textStyle: { color: chartTextColor(theme), fontSize: 12 },
    extraCssText: "box-shadow: 0 12px 32px rgb(0 0 0 / 0.12);",
  }
}

export function pieLegend(items: SummaryItem[], theme?: ChartTheme) {
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
