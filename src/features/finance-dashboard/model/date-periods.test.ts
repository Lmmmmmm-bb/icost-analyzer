import { describe, expect, it } from "vitest"

import { dateKey } from "./date"
import {
  getCurrentDatePeriod,
  getPreviousDatePeriod,
  getYearOverYearDatePeriod,
} from "./date-periods"
import { resolveTimeFilter } from "./time-filter"

const now = new Date(2024, 2, 31, 12)

describe("comparison periods", () => {
  it("uses full calendar days for comparisons and equal-length previous periods", () => {
    const period = getCurrentDatePeriod(
      resolveTimeFilter(
        { kind: "custom", from: "2024-02-01", to: "2024-02-29" },
        now
      ),
      null
    )!
    expect(period.start).toEqual(new Date(2024, 1, 1))
    expect(period.end).toEqual(new Date(2024, 1, 29, 23, 59, 59, 999))
    const previous = getPreviousDatePeriod(period)
    expect(dateKey(previous.start)).toBe("2024-01-03")
    expect(dateKey(previous.end)).toBe("2024-01-31")
  })

  it("preserves existing month-end and leap-day rollover semantics", () => {
    const bounds = resolveTimeFilter({ kind: "rolling-months", months: 1 }, now)
    expect(dateKey(bounds.start!)).toBe("2024-03-02")
    expect(dateKey(getCurrentDatePeriod(bounds, null)!.start)).toBe(
      "2024-03-02"
    )
    const leapDay = getCurrentDatePeriod(
      resolveTimeFilter(
        { kind: "custom", from: "2024-02-29", to: "2024-02-29" },
        now
      ),
      null
    )!
    expect(dateKey(getYearOverYearDatePeriod(leapDay).start)).toBe("2023-03-01")
  })

  it("fills open dates from matching rows and has no period for an empty unbounded view", () => {
    const dataRange = { start: new Date(2026, 0, 5), end: new Date(2026, 2, 8) }
    const period = getCurrentDatePeriod(
      resolveTimeFilter({ kind: "custom", from: "2026-02-01", to: null }, now),
      dataRange
    )!
    expect(dateKey(period.start)).toBe("2026-02-01")
    expect(dateKey(period.end)).toBe("2026-03-08")
    expect(
      getCurrentDatePeriod(resolveTimeFilter({ kind: "all" }, now), null)
    ).toBeNull()
  })
})
