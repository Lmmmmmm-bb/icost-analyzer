export const CHART_COLORS = [
  "#E0A23B",
  "#34CE8A",
  "#5B9BD5",
  "#F26157",
  "#9B8AFB",
  "#3FC4C4",
  "#E0844F",
  "#C9CC4D",
  "#D46FA8",
  "#7D8794",
]

export const EXPENSE_COLOR = "#F26157"
export const INCOME_COLOR = "#34CE8A"
export const BALANCE_COLOR = "#E0A23B"
export const RANKING_COLOR = "#E0A23B"
export const RANKING_COLOR_END = "#F2BE62"
export const TAG_COLOR = "#E0A23B"
export const TAG_COLOR_ACTIVE = "#F2BE62"
export const WEEK_COLOR = "rgba(224, 162, 59, 0.22)"
export const WEEKEND_COLOR = "#E0A23B"

const CHART_TOKEN_FALLBACKS = {
  1: "oklch(0.87 0 0)",
  2: "oklch(0.556 0 0)",
  3: "oklch(0.439 0 0)",
  4: "oklch(0.371 0 0)",
  5: "oklch(0.269 0 0)",
} as const

type ChartTokenIndex = keyof typeof CHART_TOKEN_FALLBACKS

export function chartTokenColor(index: ChartTokenIndex) {
  if (typeof document === "undefined") {
    return CHART_TOKEN_FALLBACKS[index]
  }

  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(`--chart-${index}`)
      .trim() || CHART_TOKEN_FALLBACKS[index]
  )
}
