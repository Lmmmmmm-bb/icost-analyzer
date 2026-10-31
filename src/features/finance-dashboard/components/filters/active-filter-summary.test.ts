import { describe, expect, it } from "vitest"

import { clearFilterGroup, createEmptyFilters } from "../../model/filters"
import { getActiveFilterSummaries } from "./active-filter-summary"

describe("filter summary identity", () => {
  it("clears the right field even if its displayed label changes", () => {
    const filters = {
      ...createEmptyFilters(),
      categories: ["演示"],
      tags: ["旅行"],
    }
    const summary = getActiveFilterSummaries(
      filters,
      new Date(2026, 9, 31)
    ).find((item) => item.key === "categories")!
    summary.label = "另一种显示文案"
    expect(clearFilterGroup(filters, summary.key)).toEqual({
      ...filters,
      categories: [],
    })
    expect(filters.categories).toEqual(["演示"])
  })
})
