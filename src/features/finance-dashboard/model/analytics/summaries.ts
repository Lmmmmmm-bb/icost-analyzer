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
  const currencies = new Set<string>()
  const categories = new Set<string>()
  const accounts = new Set<string>()
  const books = new Set<string>()
  const tags = new Set<string>()
  const years = new Set<string>()
  for (const tx of transactions) {
    currencies.add(tx.currency)
    categories.add(tx.category)
    if (tx.account1) accounts.add(tx.account1)
    if (tx.account2) accounts.add(tx.account2)
    if (tx.book) books.add(tx.book)
    for (const tag of tx.tags) tags.add(tag)
    years.add(String(tx.date.getFullYear()))
  }
  return {
    currencies: unique([...currencies]),
    categories: unique([...categories]),
    accounts: unique([...accounts]),
    books: unique([...books]),
    tags: unique([...tags]),
    years: unique([...years]).reverse(),
  }
}

export function getDateRange(transactions: readonly Transaction[]) {
  if (!transactions.length) return null

  let start = transactions[0].date
  let end = transactions[0].date
  let startTime = start.getTime()
  let endTime = end.getTime()

  for (const tx of transactions) {
    const time = tx.date.getTime()
    if (time < startTime) {
      start = tx.date
      startTime = time
    }
    if (time > endTime) {
      end = tx.date
      endTime = time
    }
  }

  return { start, end }
}
