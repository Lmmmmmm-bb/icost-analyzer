import { describe, expect, it } from "vitest"

import { makeTransaction } from "@/features/finance-dashboard/testing/transactions"
import { filterTransactions } from "@/features/finance-dashboard/model/filtering"
import {
  createEmptyFilters,
  customTime,
} from "@/features/finance-dashboard/model/filters"
import { resolveTimeFilter } from "@/features/finance-dashboard/model/time-filter"

const now = new Date(2026, 9, 31, 12, 30)

describe("time filter resolution", () => {
  it("uses one supplied clock for year-to-date and rolling ranges", () => {
    expect(resolveTimeFilter({ kind: "year-to-date" }, now)).toEqual({
      start: new Date(2026, 0, 1),
      end: now,
      valid: true,
    })
    expect(
      resolveTimeFilter({ kind: "rolling-months", months: 3 }, now)
    ).toEqual({ start: new Date(2026, 6, 31, 12, 30), end: now, valid: true })
    expect(resolveTimeFilter({ kind: "year", year: 2024 }, now)).toEqual({
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59, 999),
      valid: true,
    })
  })

  it("includes the complete local start and end days, including subsecond records", () => {
    const rows = [
      makeTransaction("before", {
        date: new Date(2026, 9, 30, 23, 59, 59, 999),
      }),
      makeTransaction("start", { date: new Date(2026, 9, 31) }),
      makeTransaction("inside", {
        date: new Date(2026, 9, 31, 23, 59, 59, 999),
      }),
      makeTransaction("outside", { date: new Date(2026, 10, 1) }),
    ]
    expect(
      filterTransactions(
        rows,
        {
          ...createEmptyFilters(),
          time: customTime("2026-10-31", "2026-10-31"),
        },
        now
      ).map((row) => row.id)
    ).toEqual(["start", "inside"])
  })

  it.each([
    ["2026-02-30", "2026-03-01"],
    ["2026-10-31", "2026-10-01"],
    [null, "invalid"],
  ])("rejects invalid or reversed date boundaries %s / %s", (from, to) => {
    const time = customTime(from, to)
    expect(resolveTimeFilter(time, now).valid).toBe(false)
    expect(
      filterTransactions(
        [makeTransaction("row")],
        { ...createEmptyFilters(), time },
        now
      )
    ).toEqual([])
  })

  it("supports either open boundary and an unbounded empty selection", () => {
    expect(
      resolveTimeFilter(customTime("2026-10-01", null), now)
    ).toMatchObject({ start: new Date(2026, 9, 1), end: null, valid: true })
    expect(
      resolveTimeFilter(customTime(null, "2026-10-31"), now)
    ).toMatchObject({ start: null, valid: true })
    expect(customTime("", "")).toEqual({ kind: "all" })
  })
})
