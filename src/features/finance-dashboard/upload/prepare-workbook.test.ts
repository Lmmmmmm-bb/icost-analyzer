import { describe, expect, it, vi } from "vitest"
import { makeTransaction } from "@/features/finance-dashboard/testing/transactions"
import { prepareWorkbook } from "@/features/finance-dashboard/upload/prepare-workbook"

describe("workbook preparation", () => {
  it("keeps parsed data and skipped counts while indexing every batch", async () => {
    const transactions = Array.from({ length: 4001 }, (_, i) =>
      makeTransaction(String(i), { note: `Fictional ${i}` })
    )
    const yieldTask = vi.fn(async () => {})
    const prepared = await prepareWorkbook(
      { transactions, skippedRows: 2 },
      new AbortController().signal,
      yieldTask
    )
    expect(prepared.transactions).toBe(transactions)
    expect(prepared.skippedRows).toBe(2)
    expect(prepared.searchIndex.size).toBe(4001)
    expect(prepared.searchIndex.get(transactions[4000])).toContain(
      "fictional 4000"
    )
    expect(yieldTask).toHaveBeenCalledTimes(3)
  })

  it("rejects cancellation during preparation instead of returning a partial workbook", async () => {
    const signal = new AbortController()
    const transactions = Array.from({ length: 4001 }, (_, i) =>
      makeTransaction(String(i))
    )
    await expect(
      prepareWorkbook(
        { transactions, skippedRows: 0 },
        signal.signal,
        async () => signal.abort()
      )
    ).rejects.toMatchObject({ name: "AbortError" })
  })
})
