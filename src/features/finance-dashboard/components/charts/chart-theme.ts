const CHART_TOKEN_FALLBACKS = {
  1: "oklch(0.87 0 0)",
  2: "oklch(0.556 0 0)",
  3: "oklch(0.439 0 0)",
  4: "oklch(0.371 0 0)",
  5: "oklch(0.269 0 0)",
} as const

type ChartTokenIndex = keyof typeof CHART_TOKEN_FALLBACKS

const CHART_TOKEN_INDICES = [1, 2, 3, 4, 5] as const
const PIE_CHART_TOKEN_INDICES = [4, 3, 2, 1] as const

function readChartTokenColor(
  index: ChartTokenIndex,
  styles?: CSSStyleDeclaration
) {
  return (
    styles?.getPropertyValue(`--chart-${index}`).trim() ||
    CHART_TOKEN_FALLBACKS[index]
  )
}

export function chartTokenColor(index: ChartTokenIndex) {
  if (typeof document === "undefined") {
    return CHART_TOKEN_FALLBACKS[index]
  }

  return readChartTokenColor(index, getComputedStyle(document.documentElement))
}

export function chartTokenColors(
  indices: readonly ChartTokenIndex[] = CHART_TOKEN_INDICES
) {
  const styles =
    typeof document === "undefined"
      ? undefined
      : getComputedStyle(document.documentElement)

  return indices.map((index) => readChartTokenColor(index, styles))
}

export function pieChartTokenColors() {
  return chartTokenColors(PIE_CHART_TOKEN_INDICES)
}
