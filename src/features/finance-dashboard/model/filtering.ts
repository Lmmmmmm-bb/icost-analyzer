import { resolveTimeFilter, type DateBounds } from "./time-filter"
import type { Filters, Transaction } from "./types"
import {
  transactionSearchText,
  type TransactionSearchIndex,
} from "@/features/finance-dashboard/model/transaction-search"

export function filterTransactions(
  transactions: readonly Transaction[],
  filters: Filters,
  now: Date,
  bounds: DateBounds = resolveTimeFilter(filters.time, now),
  searchIndex?: TransactionSearchIndex
) {
  if (!bounds.valid) return []
  const { start, end } = bounds
  const startTime = start?.getTime()
  const endTime = end?.getTime()
  const keyword = filters.keyword.trim().toLowerCase()
  const typeSet = filters.types.length ? new Set(filters.types) : null
  const currencySet = filters.currencies.length
    ? new Set(filters.currencies)
    : null
  const categorySet = filters.categories.length
    ? new Set(filters.categories)
    : null
  const accountSet = filters.accounts.length ? new Set(filters.accounts) : null
  const bookSet = filters.books.length ? new Set(filters.books) : null
  const tagSet = filters.tags.length ? new Set(filters.tags) : null
  const excludedTagSet = filters.excludedTags.length
    ? new Set(filters.excludedTags)
    : null
  return transactions.filter((tx) => {
    const time = start || end ? tx.date.getTime() : 0
    return (
      (startTime === undefined || time >= startTime) &&
      (endTime === undefined || time <= endTime) &&
      (!typeSet || typeSet.has(tx.type)) &&
      (!currencySet || currencySet.has(tx.currency)) &&
      (!categorySet || categorySet.has(tx.category)) &&
      (!accountSet || matchesAccount(tx, accountSet)) &&
      (!bookSet || bookSet.has(tx.book)) &&
      (!tagSet || tx.tags.some((tag) => tagSet.has(tag))) &&
      (!excludedTagSet || !tx.tags.some((tag) => excludedTagSet.has(tag))) &&
      (!keyword ||
        (searchIndex?.get(tx) ?? transactionSearchText(tx)).includes(keyword))
    )
  })
}

function matchesAccount(tx: Transaction, accountSet: Set<string>) {
  if (tx.type === "转账") {
    return accountSet.has(tx.account1) || accountSet.has(tx.account2)
  }

  return accountSet.has(tx.account1)
}
