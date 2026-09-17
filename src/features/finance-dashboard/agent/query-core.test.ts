import { describe, expect, it } from "vitest"

import { EMPTY_FILTERS } from "../model/constants"
import { filterTransactions } from "../model/filtering"
import type { Filters, Transaction } from "../model/types"
import {
  comparePeriods,
  getBreakdown,
  getContext,
  getSummary,
} from "./query-core"
import { groupInputSchema, summaryInputSchema } from "./query-schema"
import type { LedgerSnapshot } from "./query-types"

const CONTEXT_ID = "11111111-1111-4111-8111-111111111111"

function transaction(
  day: string,
  amount: number,
  currency: string,
  category: string,
  type: string,
  tags: string[] = []
): Transaction {
  const [year, month, date] = day.split("-").map(Number)
  return {
    id: `${day}-${category}-${amount}`,
    date: new Date(year, month - 1, date, 12),
    dateText: `${day} 12:00`,
    dayKey: day,
    monthKey: day.slice(0, 7),
    type,
    amount,
    currency,
    category,
    subcategory: "一般",
    account1: "虚构账户 A",
    account2: "",
    book: "演示账本",
    note: "只用于测试的备注",
    tags,
    location: "",
  }
}

function snapshot(filters: Filters = EMPTY_FILTERS): LedgerSnapshot {
  const transactions = [
    transaction("2026-08-10", -100, "CNY", "餐饮", "支出", ["餐饮", "旅行"]),
    transaction("2026-08-11", -10, "USD", "餐饮", "支出", ["旅行"]),
    transaction("2026-08-12", -5, "XYZ", "交通", "支出", ["旅行"]),
    transaction("2026-08-15", 300, "CNY", "工资", "收入"),
    transaction("2026-08-16", 30, "CNY", "餐饮", "退款入账"),
    transaction("2026-07-12", -50, "CNY", "餐饮", "支出"),
  ]
  return {
    contextId: CONTEXT_ID,
    transactions,
    currentViewRows: filterTransactions(
      transactions,
      filters,
      false,
      new Date("2026-09-17T00:00:00+08:00")
    ),
    filters,
    rates: { CNY: 1, USD: 2 },
    asOf: "2026-09-17T00:00:00+08:00",
    timeZone: "Asia/Shanghai",
    uploadEpoch: 0,
  }
}

describe("agent query core", () => {
  it("defaults to the current filtered view and intersects extra conditions", () => {
    const state = snapshot({
      ...EMPTY_FILTERS,
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      categories: ["餐饮"],
    })
    const context = getContext(state)
    expect(context.ok && context.data.currentViewRows).toBe(3)

    const summary = getSummary(state, { expectedContextId: CONTEXT_ID })
    expect(summary.ok && summary.data.totalExpense).toBe(120)
    expect(summary.ok && summary.data.count).toBe(3)

    const extra = getSummary(state, {
      expectedContextId: CONTEXT_ID,
      where: { currencies: ["USD"] },
    })
    expect(extra.ok && extra.data.totalExpense).toBe(20)
    expect(extra.ok && extra.context.matchedRows).toBe(1)

    const impossible = getSummary(state, {
      expectedContextId: CONTEXT_ID,
      where: { categories: ["交通"] },
    })
    expect(impossible.ok && impossible.context.matchedRows).toBe(0)

    const all = getSummary(state, {
      expectedContextId: CONTEXT_ID,
      scope: "all_data",
    })
    expect(all.ok && all.data.totalExpense).toBe(170)
    expect(all.ok && all.data.totalIncome).toBe(330)
    expect(all.ok && all.context.filters).toBeNull()
    expect(all.ok && all.context.conversionStatus).toBe("partial")
    expect(all.ok && all.context.excludedOriginalAmount.XYZ).toBe(5)
    expect(all.ok && all.context.excludedFromConversionCount).toBe(1)
  })

  it("groups expenses without leaking transaction notes and marks affected groups", () => {
    const state = snapshot()
    const result = getBreakdown(state, {
      expectedContextId: CONTEXT_ID,
      dimension: "tag",
      limit: 1,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.truncated).toBe(true)
    expect(result.data.totalGroups).toBe(2)
    expect(result.data.note).toContain("重叠")
    expect(JSON.stringify(result)).not.toContain("只用于测试的备注")
    expect(result.data.groups[0].conversionStatus).toBe("partial")
    expect(result.data.groups[0].amount).toBe(120)
  })

  it("compares explicit dates while preserving non-date page filters", () => {
    const state = snapshot({
      ...EMPTY_FILTERS,
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      categories: ["餐饮"],
    })
    const result = comparePeriods(state, {
      expectedContextId: CONTEXT_ID,
      currentPeriod: { from: "2026-08-01", to: "2026-08-31" },
      previousPeriod: { from: "2026-07-01", to: "2026-07-31" },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.expense).toMatchObject({
      current: 120,
      previous: 50,
      change: 70,
    })
    expect(result.data.previousPeriod).toMatchObject({ matchedRows: 1 })
    expect(result.context.filters?.startDate).toBe("")
    expect(result.context.filters?.categories).toEqual(["餐饮"])
  })

  it("can compare explicit periods even when page dates are invalid", () => {
    const state = snapshot({
      ...EMPTY_FILTERS,
      startDate: "2026-09-01",
      endDate: "2026-08-01",
      categories: ["餐饮"],
    })
    const result = comparePeriods(state, {
      expectedContextId: CONTEXT_ID,
      currentPeriod: { from: "2026-08-01", to: "2026-08-31" },
      previousPeriod: { from: "2026-07-01", to: "2026-07-31" },
    })
    expect(result.ok && result.data.expense).toMatchObject({
      current: 120,
      previous: 50,
    })
  })

  it("ignores page filters only when comparing all data", () => {
    const state = snapshot({ ...EMPTY_FILTERS, categories: ["交通"] })
    const periods = {
      expectedContextId: CONTEXT_ID,
      currentPeriod: { from: "2026-08-01", to: "2026-08-31" },
      previousPeriod: { from: "2026-07-01", to: "2026-07-31" },
    } as const
    const currentView = comparePeriods(state, { ...periods })
    expect(currentView.ok && currentView.data.canCompare).toBe(false)
    expect(currentView.ok && currentView.data.expense).toMatchObject({
      current: 0,
      previous: 0,
    })

    const allData = comparePeriods(state, { ...periods, scope: "all_data" })
    expect(allData.ok && allData.data.canCompare).toBe(true)
    expect(allData.ok && allData.data.expense).toMatchObject({
      current: 120,
      previous: 50,
    })
    expect(allData.ok && allData.context.filters).toBeNull()
    expect(allData.ok && allData.data.dateRule).toContain("不使用页面筛选")
  })

  it("rejects stale contexts and invalid or oversized inputs", () => {
    const state = snapshot()
    expect(
      getSummary(state, {
        expectedContextId: "22222222-2222-4222-8222-222222222222",
      })
    ).toMatchObject({ ok: false, error: { code: "STALE_CONTEXT" } })
    expect(
      summaryInputSchema.safeParse({
        expectedContextId: CONTEXT_ID,
        unknown: true,
      }).success
    ).toBe(false)
    expect(
      summaryInputSchema.safeParse({
        expectedContextId: CONTEXT_ID,
        where: { from: "2026-02-30" },
      }).success
    ).toBe(false)
    expect(
      groupInputSchema.safeParse({
        expectedContextId: CONTEXT_ID,
        dimension: "category",
        limit: 51,
      }).success
    ).toBe(false)
  })
})
