import { describe, expect, it } from "vitest"

import {
  createDashboardViewState,
  dashboardReducer,
  type DashboardAction,
} from "@/features/finance-dashboard/model/dashboard-state"

describe("dashboard state transitions", () => {
  it("clears an old category drill before applying a new category filter", () => {
    const drilled = {
      ...createDashboardViewState(),
      drillCategory: "演示餐饮",
      page: 8,
    }
    const next = dashboardReducer(drilled, {
      type: "set-list-filter",
      key: "categories",
      values: ["演示交通"],
    })
    expect(next.drillCategory).toBe("")
    expect(next.page).toBe(1)
    expect(next.filters.categories).toEqual(["演示交通"])
    expect(drilled.drillCategory).toBe("演示餐饮")
  })

  it("clears only the requested filter group without mutating the previous state", () => {
    const initial = createDashboardViewState()
    const state = {
      ...initial,
      filters: { ...initial.filters, categories: ["演示"], tags: ["旅行"] },
    }
    const next = dashboardReducer(state, {
      type: "clear-filter",
      key: "categories",
    })
    expect(next.filters).toEqual({ ...state.filters, categories: [] })
    expect(state.filters.categories).toEqual(["演示"])
  })

  it.each([
    { type: "set-time", time: { kind: "year", year: 2026 } },
    { type: "set-keyword", keyword: "演示" },
    { type: "set-list-filter", key: "currencies", values: ["USD"] },
    { type: "clear-filter", key: "accounts" },
    { type: "reset-filters" },
    { type: "focus-tag", tag: "演示" },
  ] satisfies DashboardAction[])(
    "resets linked view state for $type",
    (action) => {
      const state = {
        ...createDashboardViewState(50),
        page: 7,
        drillCategory: "旧分类",
        detailSort: "amount" as const,
      }
      expect(dashboardReducer(state, action)).toMatchObject({
        page: 1,
        drillCategory: "",
        pageSize: 50,
        detailSort: "amount",
      })
    }
  )

  it("keeps included and excluded tags disjoint using the latest action", () => {
    let state = createDashboardViewState()
    state = dashboardReducer(state, {
      type: "set-list-filter",
      key: "tags",
      values: ["A", "B"],
    })
    state = dashboardReducer(state, {
      type: "set-list-filter",
      key: "excludedTags",
      values: ["B", "C"],
    })
    expect(state.filters).toMatchObject({
      tags: ["A"],
      excludedTags: ["B", "C"],
    })
    state = dashboardReducer(state, {
      type: "set-list-filter",
      key: "tags",
      values: ["C"],
    })
    expect(state.filters).toMatchObject({ tags: ["C"], excludedTags: ["B"] })
    state = dashboardReducer(state, { type: "focus-tag", tag: "A" })
    expect(state.filters).toMatchObject({ tags: ["A"], excludedTags: [] })
  })

  it("resets pagination for detail controls but keeps filter identity for presentation actions", () => {
    const state = { ...createDashboardViewState(), page: 4 }
    const sorted = dashboardReducer(state, {
      type: "detail-sort",
      sort: "amount",
    })
    expect(sorted.page).toBe(1)
    expect(sorted.filters).toBe(state.filters)
    const resized = dashboardReducer(state, {
      type: "page-size",
      pageSize: 100,
    })
    expect(resized).toMatchObject({ page: 1, pageSize: 100 })
    expect(resized.filters).toBe(state.filters)
    expect(dashboardReducer(state, { type: "page", page: 5 }).filters).toBe(
      state.filters
    )
    expect(dashboardReducer(state, { type: "page-size", pageSize: 0 })).toBe(
      state
    )
    expect(dashboardReducer(state, { type: "page", page: -2 }).page).toBe(1)
  })

  it("applies a new workbook by resetting all view controls except page size", () => {
    const state = {
      ...createDashboardViewState(100),
      page: 3,
      drillCategory: "演示",
      detailSort: "amount" as const,
      summarySort: "count" as const,
    }
    expect(dashboardReducer(state, { type: "workbook-applied" })).toEqual(
      createDashboardViewState(100)
    )
  })
})
