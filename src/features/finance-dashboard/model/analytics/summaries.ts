import type { SummaryItem } from "../analytics-types"
import { unique } from "../collections"
import { expenseRmb } from "../money"
import { isExpenseTransaction } from "../transaction-rules"
import type { Dimensions, RateMap, Transaction } from "../types"

export function summarizeBy(
  transactions: readonly Transaction[],
  rates: RateMap,
  pickNames: (tx: Transaction) => string | readonly string[]
): SummaryItem[] {
  const map = new Map<string, SummaryItem>()
  for (const tx of transactions) {
    if (!isExpenseTransaction(tx)) continue

    const picked = pickNames(tx)
    const names = typeof picked === "string" ? [picked] : picked
    for (const name of names) {
      const item = map.get(name) ?? {
        name,
        count: 0,
        amount: 0,
        days: new Set<string>(),
      }
      item.count += 1
      item.amount += expenseRmb(tx, rates)
      item.days.add(tx.dayKey)
      map.set(name, item)
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
}

export function getDimensions(
  transactions: readonly Transaction[]
): Dimensions {
  const tags = transactions.flatMap((tx) => tx.tags)
  const accounts = transactions.flatMap((tx) => [tx.account1, tx.account2])
  return {
    currencies: unique(transactions.map((tx) => tx.currency)),
    categories: unique(transactions.map((tx) => tx.category)),
    accounts: unique(accounts.filter(Boolean)),
    books: unique(transactions.map((tx) => tx.book).filter(Boolean)),
    tags: unique(tags),
    years: unique(
      transactions.map((tx) => String(tx.date.getFullYear()))
    ).reverse(),
  }
}

export function getDateRange(transactions: readonly Transaction[]) {
  if (!transactions.length) return null

  let start = transactions[0].date
  let end = transactions[0].date

  for (const tx of transactions) {
    if (tx.date < start) start = tx.date
    if (tx.date > end) end = tx.date
  }

  return { start, end }
}
