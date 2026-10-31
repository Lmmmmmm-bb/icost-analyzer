import { describe, expect, it } from "vitest"

import { makeTransaction } from "../testing/transactions"
import { getDailySummary, getMonthlySummary } from "./analytics"
import {
  selectDayDetails,
  selectMonthDetails,
  selectMonthlyReview,
} from "./transaction-details"

const rates = { CNY: 1, USD: 2 }
const rows = [
  makeTransaction("early", { date: new Date(2026, 0, 1), amount: -20 }),
  makeTransaction("foreign", {
    date: new Date(2026, 0, 2),
    amount: -15,
    currency: "USD",
    tags: ["虚构标签"],
  }),
  makeTransaction("income", {
    date: new Date(2026, 0, 2),
    type: "收入",
    amount: 100,
  }),
  makeTransaction("missing", {
    date: new Date(2026, 0, 2),
    currency: "XYZ",
    amount: -1000,
  }),
  makeTransaction("other-month", { date: new Date(2026, 1, 1) }),
]

describe("aggregate and detail boundaries", () => {
  it("aggregates without bill arrays or private detail fields", () => {
    const monthly = getMonthlySummary(rows, rates)
    expect(monthly[0]).toEqual({
      month: "2026-01",
      expense: 50,
      income: 100,
      net: 50,
      count: 4,
      savingsRate: 0.5,
    })
    const daily = getDailySummary(rows, rates)
    expect(daily[1]).toEqual({
      day: "2026-01-02",
      date: new Date(2026, 0, 2),
      expense: 30,
      income: 100,
      net: 70,
      count: 3,
    })
    for (const aggregate of [...monthly, ...daily]) {
      expect(aggregate).not.toHaveProperty("bills")
      expect(aggregate).not.toHaveProperty("note")
      expect(aggregate).not.toHaveProperty("largestExpense")
    }
  })

  it("selects only one month, sorts newest first and preserves detail values", () => {
    const originalOrder = rows.map((row) => row.id)
    const bills = selectMonthDetails(rows, rates, "2026-01")
    expect(bills.map((bill) => bill.id)).toEqual([
      "foreign",
      "income",
      "missing",
      "early",
    ])
    expect(bills[0]).toMatchObject({
      amount: -15,
      rmb: -30,
      direction: "expense",
      note: "仅用于测试的虚构备注",
      tags: ["虚构标签"],
    })
    expect(bills[2].rmb).toBe(-0)
    expect(rows.map((row) => row.id)).toEqual(originalOrder)
    expect(selectMonthDetails(rows, rates, "2025-12")).toEqual([])
  })

  it("selects only one day and preserves original order", () => {
    const bills = selectDayDetails(rows, rates, "2026-01-02")
    expect(bills.map((bill) => bill.id)).toEqual([
      "foreign",
      "income",
      "missing",
    ])
    expect(bills[1]).toMatchObject({ rmb: 100, direction: "income" })
    expect(selectDayDetails(rows, rates, "2026-01-03")).toEqual([])
  })

  it("derives monthly review separately and counts missing-rate bills", () => {
    const monthly = getMonthlySummary(rows, rates)
    const review = selectMonthlyReview(rows, rates, monthly)
    expect(review[0]).toMatchObject({
      count: 4,
      topExpenseCategory: { name: "演示餐饮", amount: 50 },
      largestExpense: { id: "foreign", amount: 15, rmb: 30, day: "2026-01-02" },
    })
    expect(review[0]).not.toHaveProperty("bills")
    expect(monthly[0]).not.toHaveProperty("largestExpense")
  })

  it("preserves ties and the empty-expense review state", () => {
    const tied = [
      makeTransaction("first", { category: "虚构A", amount: -20 }),
      makeTransaction("second", { category: "虚构B", amount: -20 }),
    ]
    expect(
      selectMonthlyReview(tied, rates, getMonthlySummary(tied, rates))[0]
    ).toMatchObject({
      topExpenseCategory: { name: "虚构A", amount: 20 },
      largestExpense: { id: "first" },
    })
    const income = [rows[2]]
    expect(
      selectMonthlyReview(income, rates, getMonthlySummary(income, rates))[0]
    ).toMatchObject({
      topExpenseCategory: { name: "暂无支出", amount: 0 },
      largestExpense: null,
    })
  })
})
