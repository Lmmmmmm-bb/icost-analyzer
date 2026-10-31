import { dateKey } from "@/features/finance-dashboard/model/date"
import type { HeatmapColorScaleMode } from "@/features/finance-dashboard/components/charts/types"

export type HeatmapYearData = {
  year: string
  values: [string, number][]
  cappedDays: number
  colorMaxValue: number
  actualMaxValue: number
}

/** Scale is computed once across all years, independent of viewport visibility. */
export function createHeatmapYears(
  heatmap: [string, number][],
  scaleMode: HeatmapColorScaleMode,
  emptyYear: string
): HeatmapYearData[] {
  const amounts = heatmap
    .map(([, amount]) => amount)
    .filter((amount) => amount > 0)
    .sort((a, b) => a - b)
  const actualMaxValue = Math.max(amounts.at(-1) ?? 0, 1)
  const p95 = amounts[Math.floor((amounts.length - 1) * 0.95)] ?? 0
  const colorMaxValue =
    scaleMode === "robust" && p95 > 0
      ? Math.min(p95, actualMaxValue)
      : actualMaxValue
  const groups = new Map<string, [string, number][]>()
  for (const item of heatmap) {
    const year = item[0].slice(0, 4)
    const group = groups.get(year) ?? []
    group.push(item)
    groups.set(year, group)
  }
  if (!groups.size) groups.set(emptyYear, [])
  return [...groups].map(([year, values]) => ({
    year,
    values,
    colorMaxValue,
    actualMaxValue,
    cappedDays: values.filter(([, amount]) => amount > colorMaxValue).length,
  }))
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
