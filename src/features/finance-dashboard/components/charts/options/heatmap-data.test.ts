import { describe, expect, it } from "vitest"

import {
  createHeatmapData,
  fillYearHeatmap,
} from "@/features/finance-dashboard/components/charts/options/heatmap-data"

describe("heatmap presentation data", () => {
  it("computes one global P95 across years without capping actual amounts", () => {
    const input: [string, number][] = [
      ["2024-02-29", 10],
      ["2024-03-01", 20],
      ["2025-01-01", 1000],
    ]
    const data = createHeatmapData(input, "robust", "2026")
    expect(data).toMatchObject({
      colorMaxValue: 20,
      cappedDays: 1,
      actualMaxValue: 1000,
    })
    expect(data.years).toEqual([
      { year: "2024", values: input.slice(0, 2) },
      { year: "2025", values: [["2025-01-01", 1000]] },
    ])
    expect(createHeatmapData(input, "full", "2026")).toMatchObject({
      colorMaxValue: 1000,
      cappedDays: 0,
      actualMaxValue: 1000,
    })
  })

  it("keeps fractional thresholds and real maxima separate from the minimum full scale", () => {
    const input: [string, number][] = [
      ["2024-01-01", 0.1],
      ["2024-01-02", 0.2],
      ["2025-01-01", 0.3],
    ]
    expect(createHeatmapData(input, "robust", "2026")).toMatchObject({
      colorMaxValue: 0.2,
      actualMaxValue: 0.3,
      cappedDays: 1,
    })
    expect(createHeatmapData(input, "full", "2026")).toMatchObject({
      colorMaxValue: 1,
      actualMaxValue: 0.3,
      cappedDays: 0,
    })
  })

  it("keeps zero days and uses an explicit year for an income-only selection", () => {
    expect(createHeatmapData([], "robust", "2026")).toEqual({
      years: [{ year: "2026", values: [] }],
      cappedDays: 0,
      colorMaxValue: 1,
      actualMaxValue: 0,
    })
    expect(createHeatmapData([["2024-01-01", 0]], "robust", "2026")).toEqual({
      years: [{ year: "2024", values: [["2024-01-01", 0]] }],
      cappedDays: 0,
      colorMaxValue: 1,
      actualMaxValue: 0,
    })
  })

  it("fills leap and non-leap years without moving transactions across dates", () => {
    const leap = fillYearHeatmap("2024", [["2024-02-29", 123]])
    expect(leap).toHaveLength(366)
    expect(leap[59]).toEqual(["2024-02-29", 123])
    expect(leap[60]).toEqual(["2024-03-01", 0])
    expect(leap.at(-1)).toEqual(["2024-12-31", 0])
    expect(fillYearHeatmap("2025", [])).toHaveLength(365)
  })
})
