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
  it("treats timestamp zero as a real inclusive boundary", () => {
    const rows = [-1, 0, 1, 2].map((time) => ({
      ...row("1970-01-01", "支出", "A"),
      id: String(time),
      date: new Date(time),
    }))
    expect(
      filterTransactions(rows, EMPTY_FILTERS, new Date(0), {
        start: new Date(0),
        end: new Date(1),
        valid: true,
      }).map((tx) => tx.id)
    ).toEqual(["0", "1"])
  })

  it.each([
    "note",
    "category",
    "subcategory",
    "account1",
    "account2",
    "book",
    "location",
    "currency",
  ])("keeps case-insensitive substring searches in %s", (field) => {
    const match = {
      ...row("2024-02-29", "支出", "A"),
      [field]: "before FiXtUrE after",
    }
    const result = filterTransactions(
      [match, row("2024-03-01", "支出", "B")],
      { ...EMPTY_FILTERS, keyword: "  fixture  " },
      new Date(2024, 2, 1)
    )
    expect(result.map((tx) => tx.id)).toEqual(["2024-02-29"])
  })

  it("combines dates, type, tags and exclusions before matching the same keyword fields", () => {
    const base = { ...row("2024-02-29", "支出", "A"), tags: ["旅行", "coffee"] }
    const result = filterTransactions(
      [
        base,
        { ...row("2024-03-01", "支出", "A"), tags: base.tags },
        { ...base, id: "income", type: "收入" },
        { ...base, id: "excluded", tags: [...base.tags, "跳过"] },
      ],
      {
        ...EMPTY_FILTERS,
        time: { kind: "custom", from: "2024-02-29", to: "2024-02-29" },
        types: ["支出"],
        tags: ["旅行"],
        excludedTags: ["跳过"],
        keyword: "COFFEE",
      },
      new Date(2024, 2, 1)
    )
    expect(result.map((tx) => tx.id)).toEqual(["2024-02-29"])
  })

  it("preserves matches across adjacent fields", () => {
    const match = {
      ...row("2024-02-29", "支出", "A"),
      note: "旅行",
      category: "餐饮",
    }
    expect(
      filterTransactions(
        [match],
        { ...EMPTY_FILTERS, keyword: "旅行 餐饮" },
        new Date(2024, 2, 1)
      )
    ).toEqual([match])
  })

  it("uses the supplied clock for quick ranges", () => {
    const rows = [
      row("2026-08-01", "支出", "A"),
      row("2026-01-01", "支出", "A"),
    ]
    const result = filterTransactions(
      rows,
      { ...EMPTY_FILTERS, time: { kind: "rolling-months", months: 3 } },
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
        time: { kind: "custom", from: "2026-08-01", to: "2026-08-02" },
      },
      new Date(2026, 9, 31)
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
      new Date(2026, 9, 31)
    )
    expect(result.map((item) => item.type)).toEqual(["转账"])
  })
})
