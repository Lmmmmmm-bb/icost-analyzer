import { describe, expect, it } from "vitest"

import { createEmptyFilters, type TimeFilter } from "../model/filters"
import { filterFromWhere, toQueryFilters } from "./query-filters"

describe("agent filter compatibility", () => {
  it.each([
    [{ kind: "all" }, "全部", "", "", ""],
    [{ kind: "year-to-date" }, "今年", "", "", ""],
    [{ kind: "rolling-months", months: 3 }, "近 3 个月", "", "", ""],
    [{ kind: "year", year: 2024 }, "全部", "2024", "", ""],
    [
      { kind: "custom", from: "2026-01-01", to: null },
      "全部",
      "",
      "2026-01-01",
      "",
    ],
  ] satisfies [TimeFilter, string, string, string, string][])(
    "preserves public fields for %j",
    (time, quickRange, year, startDate, endDate) => {
      const result = toQueryFilters({
        ...createEmptyFilters(),
        time,
        categories: ["演示"],
      })
      expect(result).toEqual({
        types: [],
        currencies: [],
        categories: ["演示"],
        accounts: [],
        books: [],
        tags: [],
        excludedTags: [],
        keyword: "",
        quickRange,
        year,
        startDate,
        endDate,
      })
    }
  )

  it("maps explicit tool conditions without depending on UI labels", () => {
    expect(
      filterFromWhere({ from: "2026-01-01", tags: ["演示"], keyword: "虚构" })
    ).toEqual({
      ...createEmptyFilters(),
      time: { kind: "custom", from: "2026-01-01", to: null },
      tags: ["演示"],
      keyword: "虚构",
    })
  })
})
