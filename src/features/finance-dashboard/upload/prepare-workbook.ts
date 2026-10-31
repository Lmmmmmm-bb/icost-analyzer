import {
  createTransactionSearchIndex,
  type TransactionSearchIndex,
} from "@/features/finance-dashboard/model/transaction-search"
import type { WorkbookParseResult } from "@/features/finance-dashboard/upload/workbook-parser"
import type { Transaction } from "@/features/finance-dashboard/model/types"

export type PreparedWorkbook = WorkbookParseResult & {
  searchIndex: TransactionSearchIndex
}

async function yieldToBrowser() {
  const scheduler = (
    globalThis as { scheduler?: { yield?: () => Promise<void> } }
  ).scheduler
  if (scheduler?.yield) await scheduler.yield()
  else await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

/** Yield between preparation batches and before committing the dashboard. */
export async function prepareWorkbook(
  result: WorkbookParseResult,
  signal: AbortSignal,
  yieldTask: () => Promise<void> = yieldToBrowser
): Promise<PreparedWorkbook> {
  const searchIndex = new Map<Transaction, string>()
  const batchSize = 2000
  signal.throwIfAborted()
  for (let start = 0; start < result.transactions.length; start += batchSize) {
    const batch = result.transactions.slice(start, start + batchSize)
    for (const [tx, text] of createTransactionSearchIndex(batch))
      searchIndex.set(tx, text)
    await yieldTask()
    signal.throwIfAborted()
  }
  return { ...result, searchIndex }
}
