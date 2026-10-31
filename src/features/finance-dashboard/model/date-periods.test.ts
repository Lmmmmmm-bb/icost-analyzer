import { afterEach, describe, expect, it, vi } from "vitest"

import { EMPTY_FILTERS } from "./constants"
import { dateKey } from "./date"
import {
  getCurrentDatePeriod,
  getPreviousDatePeriod,
  getYearOverYearDatePeriod,
} from "./date-periods"
import { getFilterDateBounds } from "./filtering"

afterEach(() => vi.useRealTimers())

describe("comparison periods", () => {
  it("uses full calendar days for comparisons and equal-length previous periods", () => {
    const period = getCurrentDatePeriod(
      { ...EMPTY_FILTERS, startDate: "2024-02-01", endDate: "2024-02-29" },
      [],
      null
    )!
    expect(period.start).toEqual(new Date(2024, 1, 1))
    expect(period.end).toEqual(new Date(2024, 1, 29, 23, 59, 59, 999))
    const previous = getPreviousDatePeriod(period)
    expect(dateKey(previous.start)).toBe("2024-01-03")
    expect(dateKey(previous.end)).toBe("2024-01-31")
  })

  it("preserves existing month-end and leap-day rollover semantics", () => {
    vi.useFakeTimers()
    const now = new Date(2024, 2, 31, 12)
    vi.setSystemTime(now)
    const filters = { ...EMPTY_FILTERS, quickRange: "近 1 个月" }
    expect(dateKey(getFilterDateBounds(filters, now).start!)).toBe("2024-03-02")
    expect(dateKey(getCurrentDatePeriod(filters, [], null)!.start)).toBe(
      "2024-03-02"
    )
    const leapDay = getCurrentDatePeriod(
      { ...EMPTY_FILTERS, startDate: "2024-02-29", endDate: "2024-02-29" },
      [],
      null
    )!
    expect(dateKey(getYearOverYearDatePeriod(leapDay).start)).toBe("2023-03-01")
  })

  it("fills open dates from matching rows and has no period for an empty unbounded view", () => {
    const dataRange = { start: new Date(2026, 0, 5), end: new Date(2026, 2, 8) }
    const period = getCurrentDatePeriod(
      { ...EMPTY_FILTERS, startDate: "2026-02-01" },
      [],
      dataRange
    )!
    expect(dateKey(period.start)).toBe("2026-02-01")
    expect(dateKey(period.end)).toBe("2026-03-08")
    expect(getCurrentDatePeriod(EMPTY_FILTERS, [], null)).toBeNull()
  })
})
