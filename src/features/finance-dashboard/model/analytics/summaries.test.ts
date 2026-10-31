import { describe, expect, it } from "vitest"
import { makeTransaction } from "@/features/finance-dashboard/testing/transactions"
import {
  getDateRange,
  getDimensions,
} from "@/features/finance-dashboard/model/analytics/summaries"

describe("ledger dimensions", () => {
  it("deduplicates both accounts, preserves tag values, and sorts years descending", () => {
    const rows = [
      makeTransaction("1", {
        currency: "USD",
        category: "B",
        account1: "",
        account2: "B",
        book: "",
        tags: ["b", "", "a"],
        date: new Date(2024, 0, 1),
      }),
      makeTransaction("2", {
        currency: "CNY",
        category: "A",
        account1: "B",
        account2: "A",
        book: "A",
        tags: ["a"],
        date: new Date(2026, 0, 1),
      }),
    ]
    expect(getDimensions(rows)).toEqual({
      currencies: ["CNY", "USD"],
      categories: ["A", "B"],
      accounts: ["A", "B"],
      books: ["A"],
      tags: ["", "a", "b"],
      years: ["2026", "2024"],
    })
    expect(getDimensions([])).toEqual({
      currencies: [],
      categories: [],
      accounts: [],
      books: [],
      tags: [],
      years: [],
    })
  })
})

describe("ledger date range", () => {
  it("retains exact boundary instants and the original Date references", () => {
    const dates = [new Date(1), new Date(-1), new Date(0), new Date(1)]
    const rows = dates.map((date, i) => makeTransaction(String(i), { date }))
    const result = getDateRange(rows)
    expect(result?.start).toBe(dates[1])
    expect(result?.end).toBe(dates[0])
    expect(getDateRange([])).toBeNull()
    expect(getDateRange([rows[2]])).toEqual({ start: dates[2], end: dates[2] })
  })
})
