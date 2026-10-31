import { dateKey } from "@/features/finance-dashboard/model/date"

export type HeatmapColorScaleMode = "robust" | "full"

export type HeatmapYearData = {
  year: string
  values: [string, number][]
}

export type HeatmapData = {
  years: HeatmapYearData[]
  cappedDays: number
  colorMaxValue: number
  actualMaxValue: number
}

/** Scale is computed once across all years, independent of viewport visibility. */
export function createHeatmapData(
  heatmap: readonly [string, number][],
  scaleMode: HeatmapColorScaleMode,
  emptyYear: string
): HeatmapData {
  const amounts = heatmap
    .map(([, amount]) => amount)
    .filter((amount) => amount > 0)
    .sort((a, b) => a - b)
  const actualMaxValue = amounts.at(-1) ?? 0
  const p95 = amounts[Math.floor((amounts.length - 1) * 0.95)] ?? 0
  const colorMaxValue =
    scaleMode === "robust" && p95 > 0
      ? Math.min(p95, actualMaxValue)
      : Math.max(actualMaxValue, 1)
  const groups = new Map<string, [string, number][]>()
  for (const item of heatmap) {
    const year = item[0].slice(0, 4)
    const group = groups.get(year) ?? []
    group.push(item)
    groups.set(year, group)
  }
  if (!groups.size) groups.set(emptyYear, [])
  return {
    years: [...groups].map(([year, values]) => ({ year, values })),
    colorMaxValue,
    actualMaxValue,
    cappedDays: amounts.filter((amount) => amount > colorMaxValue).length,
  }
}

/** Allocate the calendar cells only when the corresponding year is displayed. */
export function fillYearHeatmap(year: string, values: [string, number][]) {
  const byDate = new Map(values)
  const days: [string, number][] = []
  const date = new Date(Number(year), 0, 1)
  while (date.getFullYear() === Number(year)) {
    const key = dateKey(date)
    days.push([key, byDate.get(key) ?? 0])
    date.setDate(date.getDate() + 1)
  }
  return days
}
