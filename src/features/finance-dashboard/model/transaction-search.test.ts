import { describe, expect, it } from "vitest"
import { makeTransaction } from "@/features/finance-dashboard/testing/transactions"
import { createEmptyFilters } from "@/features/finance-dashboard/model/filters"
import { filterTransactions } from "@/features/finance-dashboard/model/filtering"
import { createTransactionSearchIndex } from "@/features/finance-dashboard/model/transaction-search"

describe("workbook search index", () => {
  it("keeps substring, case, cross-field and multi-tag matching identical", () => {
    const rows = [
      makeTransaction("match", {
        note: "Coffee",
        category: "旅行",
        tags: ["A", "B"],
        account2: "接收账户",
      }),
      makeTransaction("other", { note: "other" }),
    ]
    const index = createTransactionSearchIndex(rows)
    for (const keyword of [
      " COFFEE ",
      "coffee 旅行",
      "A B",
      "接收账户",
      "no-match",
    ]) {
      const filters = { ...createEmptyFilters(), keyword }
      const expected = keyword === "no-match" ? [] : ["match"]
      for (const searchIndex of [undefined, index]) {
        expect(
          filterTransactions(
            rows,
            filters,
            new Date(2026, 9, 31),
            undefined,
            searchIndex
          ).map((tx) => tx.id)
        ).toEqual(expected)
      }
    }
  })

  it("does not confuse reused row IDs across replaced workbooks or incomplete indexes", () => {
    const oldRows = [makeTransaction("same-id", { note: "old" })]
    const newRows = [makeTransaction("same-id", { note: "new" })]
    const filters = { ...createEmptyFilters(), keyword: "new" }
    for (const index of [
      createTransactionSearchIndex(oldRows),
      createTransactionSearchIndex(newRows),
    ]) {
      expect(
        filterTransactions(
          newRows,
          filters,
          new Date(2026, 9, 31),
          undefined,
          index
        )
      ).toEqual(newRows)
    }
  })
})
