import type { Transaction } from "@/features/finance-dashboard/model/types"

export type TransactionSearchIndex = ReadonlyMap<Transaction, string>

export function transactionSearchText(tx: Transaction) {
  return [
    tx.note,
    tx.category,
    tx.subcategory,
    tx.account1,
    tx.account2,
    tx.book,
    tx.tags.join(" "),
    tx.location,
    tx.currency,
  ]
    .join(" ")
    .toLowerCase()
}

/** Owned by one immutable workbook snapshot; never persisted or shared globally. */
export function createTransactionSearchIndex(
  transactions: readonly Transaction[]
): TransactionSearchIndex {
  return new Map(transactions.map((tx) => [tx, transactionSearchText(tx)]))
}
