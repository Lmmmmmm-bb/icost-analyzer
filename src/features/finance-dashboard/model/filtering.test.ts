import { describe, expect, it } from "vitest"

import { EMPTY_FILTERS } from "@/features/finance-dashboard/model/constants"
import { filterTransactions } from "@/features/finance-dashboard/model/filtering"
import { createTransactionSearchIndex } from "@/features/finance-dashboard/model/transaction-search"
import { makeTransaction } from "@/features/finance-dashboard/testing/transactions"

function row(day: string, type: string, account1: string, account2 = "") {
  return makeTransaction(day, {
    date: new Date(`${day}T12:00:00`),
    type,
    account1,
    account2,
  })
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

  it.each([false, true])(
    "matches keywords across all searchable fields (indexed: %s)",
    (indexed) => {
      const fields = [
        "note",
        "category",
        "subcategory",
        "account1",
        "account2",
        "book",
        "location",
        "currency",
      ]
      const matches = [
        ...fields.map((field) =>
          makeTransaction(field, { [field]: "before FiXtUrE after" })
        ),
        makeTransaction("tags", { tags: ["before", "FiXtUrE", "after"] }),
      ]
      const rows = [...matches, makeTransaction("unmatched")]
      const index = indexed ? createTransactionSearchIndex(rows) : undefined
      const search = (keyword: string) =>
        filterTransactions(
          rows,
          { ...EMPTY_FILTERS, keyword },
          new Date(2024, 2, 1),
          undefined,
          index
        ).map((tx) => tx.id)
      expect(search("  fixture  ")).toEqual(matches.map((tx) => tx.id))
      expect(search("no-match")).toEqual([])
    }
  )

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

  it("preserves matches across adjacent fields and tags with or without an index", () => {
    const rows = [
      makeTransaction("match", {
        note: "旅行",
        category: "餐饮",
        tags: ["A", "B"],
      }),
    ]
    for (const index of [undefined, createTransactionSearchIndex(rows)]) {
      for (const keyword of ["旅行 餐饮", "A B"]) {
        expect(
          filterTransactions(
            rows,
            { ...EMPTY_FILTERS, keyword },
            new Date(2024, 2, 1),
            undefined,
            index
          )
        ).toEqual(rows)
      }
    }
  })

  it("ignores stale index entries when a replacement workbook reuses row IDs", () => {
    const oldRows = [makeTransaction("same-id", { note: "old" })]
    const newRows = [makeTransaction("same-id", { note: "new" })]
    expect(
      filterTransactions(
        newRows,
        { ...EMPTY_FILTERS, keyword: "new" },
        new Date(2024, 2, 1),
        undefined,
        createTransactionSearchIndex(oldRows)
      )
    ).toEqual(newRows)
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
