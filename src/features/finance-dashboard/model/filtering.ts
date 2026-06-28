import { ALL_RANGE } from "./constants"
import type { Filters, Transaction } from "./types"

export function filterTransactions(
  transactions: Transaction[],
  filters: Filters,
  invalidDateRange: boolean
) {
  if (invalidDateRange) return []
  const now = new Date()
  let start: Date | null = filters.startDate
    ? new Date(filters.startDate)
    : null
  let end: Date | null = filters.endDate
    ? new Date(`${filters.endDate}T23:59:59`)
    : null

  if (!start && !end && filters.year) {
    start = new Date(`${filters.year}-01-01T00:00:00`)
    end = new Date(`${filters.year}-12-31T23:59:59`)
  } else if (!start && !end && filters.quickRange !== ALL_RANGE) {
    if (filters.quickRange === "今年") {
      start = new Date(`${now.getFullYear()}-01-01T00:00:00`)
    } else {
      const months = Number(filters.quickRange.match(/\d+/)?.[0] ?? 0)
      start = new Date(now)
      start.setMonth(start.getMonth() - months)
    }
    end = now
  }

  const keyword = filters.keyword.trim().toLowerCase()
  const typeSet = filters.types.length ? new Set(filters.types) : null
  const currencySet = filters.currencies.length
    ? new Set(filters.currencies)
    : null
  const categorySet = filters.categories.length
    ? new Set(filters.categories)
    : null
  const tagSet = filters.tags.length ? new Set(filters.tags) : null
  return transactions.filter((tx) => {
    const matchesKeyword = keyword
      ? [
          tx.note,
          tx.category,
          tx.subcategory,
          tx.tags.join(" "),
          tx.location,
          tx.currency,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      : true
    return (
      (!start || tx.date >= start) &&
      (!end || tx.date <= end) &&
      (!typeSet || typeSet.has(tx.type)) &&
      (!currencySet || currencySet.has(tx.currency)) &&
      (!categorySet || categorySet.has(tx.category)) &&
      (!tagSet || tx.tags.some((tag) => tagSet.has(tag))) &&
      matchesKeyword
    )
  })
}
