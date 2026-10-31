import { describe, expect, it } from "vitest"

import { makeTransaction } from "../testing/transactions"
import {
  getDailySummary,
  getHeatmap,
  getMonthlySummary,
  getPeriodComparison,
  getStats,
  getWeekSummary,
  summarizeBy,
} from "./analytics"

const rates = { CNY: 1, USD: 2 }
const rows = [
  makeTransaction("expense", { amount: -100, tags: ["演示 A", "演示 B"] }),
  makeTransaction("positive-expense", { amount: 20 }),
  ...(
    [
      ["income", "收入", 2000, 1],
      ["refund", "退款入账", 50, 2],
      ["reimburse", "报销入账", 40, 2],
      ["reimbursed", "已报销", -30, 3],
      ["pending", "待报销", -10, 3],
      ["transfer", "转账", 500, 3],
      ["unknown-negative", "未知类型", -7, 3],
      ["unknown-positive", "未知类型", 9, 3],
    ] as const
  ).map(([id, type, amount, day]) =>
    makeTransaction(id, { type, amount, date: new Date(2026, 1, day, 12) })
  ),
  makeTransaction("foreign", {
    currency: "USD",
    amount: -5,
    date: new Date(2026, 1, 3),
  }),
  makeTransaction("missing-rate", {
    currency: "XYZ",
    amount: -99,
    date: new Date(2026, 1, 3),
  }),
]

describe("ledger analytics", () => {
  it("preserves income breakdown, expense signs, reimbursements and missing-rate counts", () => {
    expect(getStats(rows, rates)).toEqual({
      totalExpense: 177,
      totalIncome: 2090,
      net: 1913,
      incomeBreakdown: { income: 2000, refund: 50, reimburse: 40 },
      count: 12,
      expenseCount: 7,
      monthlyExpense: 88.5,
      dailyExpense: 44.25,
      avgExpense: 177 / 7,
      maxExpense: 100,
      reimburse: 130,
      currencyCount: 3,
      tagCount: 2,
      days: 4,
    })
  })

  it("agrees across monthly, daily, weekly and heatmap totals", () => {
    const monthly = getMonthlySummary(rows, rates)
    expect(
      monthly.map(({ month, expense, income, net }) => ({
        month,
        expense,
        income,
        net,
      }))
    ).toEqual([
      { month: "2026-01", expense: 120, income: 0, net: -120 },
      { month: "2026-02", expense: 57, income: 2090, net: 2033 },
    ])
    expect(
      getDailySummary(rows, rates).reduce((sum, day) => sum + day.expense, 0)
    ).toBe(177)
    expect(
      getWeekSummary(rows, rates).reduce((sum, day) => sum + day.amount, 0)
    ).toBe(177)
    expect(
      getHeatmap(rows, rates).reduce((sum, [, value]) => sum + value, 0)
    ).toBe(177)
  })

  it("counts overlapping tags independently and distinct spending dates", () => {
    expect(summarizeBy(rows, rates, (row) => row.tags)).toEqual([
      { name: "演示 A", amount: 100, count: 1, days: new Set(["2026-01-05"]) },
      { name: "演示 B", amount: 100, count: 1, days: new Set(["2026-01-05"]) },
    ])
  })

  it("compares periods and represents a zero baseline without infinity", () => {
    const comparison = getPeriodComparison(rows, [], "本期", "上期", rates)
    expect(comparison.expense).toEqual({
      current: 177,
      previous: 0,
      change: 177,
      changeRate: null,
    })
    expect(comparison.canCompare).toBe(false)
    expect(
      getPeriodComparison([], rows, "本期", "上期", rates).expense.changeRate
    ).toBe(-1)
    expect(getStats([], rates)).toMatchObject({
      totalExpense: 0,
      totalIncome: 0,
      avgExpense: 0,
      dailyExpense: 0,
    })
  })
})
