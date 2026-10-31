import { describe, expect, it } from "vitest"

import {
  createHeatmapYears,
  fillYearHeatmap,
} from "@/features/finance-dashboard/components/charts/options/heatmap-data"

describe("heatmap presentation data", () => {
  it("uses the same global P95 in each year without capping actual amounts", () => {
    const input: [string, number][] = [
      ["2024-02-29", 10],
      ["2024-03-01", 20],
      ["2025-01-01", 1000],
    ]
    const years = createHeatmapYears(input, "robust", "2026")
    expect(years.map((year) => year.colorMaxValue)).toEqual([20, 20])
    expect(years.map((year) => year.cappedDays)).toEqual([0, 1])
    expect(years[1].values).toEqual([["2025-01-01", 1000]])
    expect(years.map((year) => year.actualMaxValue)).toEqual([1000, 1000])
    expect(
      createHeatmapYears(input, "full", "2026").map(
        (year) => year.colorMaxValue
      )
    ).toEqual([1000, 1000])
  })

  it("keeps zero days and uses an explicit year for an income-only selection", () => {
    expect(createHeatmapYears([], "robust", "2026")).toEqual([
      {
        year: "2026",
        values: [],
        cappedDays: 0,
        colorMaxValue: 1,
        actualMaxValue: 1,
      },
    ])
    expect(
      createHeatmapYears([["2024-01-01", 0]], "robust", "2026")[0].colorMaxValue
    ).toBe(1)
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
