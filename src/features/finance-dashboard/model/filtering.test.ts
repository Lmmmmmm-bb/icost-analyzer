import { describe, expect, it } from "vitest"

import { EMPTY_FILTERS } from "./constants"
import { filterTransactions } from "./filtering"
import type { Transaction } from "./types"

function row(day: string, type: string, account1: string, account2 = "") {
  return {
    id: day,
    date: new Date(`${day}T12:00:00`),
    dateText: day,
    dayKey: day,
    monthKey: day.slice(0, 7),
    type,
    amount: -10,
    currency: "CNY",
    category: "演示",
    subcategory: "演示",
    account1,
    account2,
    book: "",
    note: "",
    tags: [],
    location: "",
  } satisfies Transaction
}

describe("dashboard filtering", () => {
  it("uses the supplied clock for quick ranges", () => {
    const rows = [
      row("2026-08-01", "支出", "A"),
      row("2026-01-01", "支出", "A"),
    ]
    const result = filterTransactions(
      rows,
      { ...EMPTY_FILTERS, quickRange: "近 3 个月" },
      false,
      new Date("2026-09-17T12:00:00")
    )
    expect(result.map((item) => item.dayKey)).toEqual(["2026-08-01"])
  })

  it("includes the whole local start and end dates", () => {
    const rows = [
      { ...row("2026-08-01", "支出", "A"), date: new Date(2026, 7, 1, 0, 0) },
      {
        ...row("2026-08-02", "支出", "A"),
        date: new Date(2026, 7, 2, 23, 59, 59),
      },
      row("2026-08-03", "支出", "A"),
    ]
    const result = filterTransactions(
      rows,
      {
        ...EMPTY_FILTERS,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
      },
      false
    )
    expect(result.map((item) => item.dayKey)).toEqual([
      "2026-08-01",
      "2026-08-02",
    ])
  })

  it("matches either account for transfers, but only the first for spending", () => {
    const rows = [
      row("2026-08-01", "转账", "A", "B"),
      row("2026-08-02", "支出", "A", "B"),
    ]
    const result = filterTransactions(
      rows,
      { ...EMPTY_FILTERS, accounts: ["B"] },
      false
    )
    expect(result.map((item) => item.type)).toEqual(["转账"])
  })
})
