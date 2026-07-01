import type { SummaryItem } from "./analytics-types"
import { toRmb } from "./money"
import type {
  AccountSort,
  DetailSort,
  SummarySort,
  TagSort,
} from "./dashboard-controls"
import type { RateMap, Transaction } from "./types"

export function sortDetailRows(
  rows: Transaction[],
  sort: DetailSort,
  rates: RateMap
) {
  return [...rows].sort((a, b) => {
    if (sort === "amount")
      return Math.abs(toRmb(b, rates)) - Math.abs(toRmb(a, rates))
    return b.date.getTime() - a.date.getTime()
  })
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)

  return {
    totalPages,
    safePage,
    pagedRows: rows.slice((safePage - 1) * pageSize, safePage * pageSize),
  }
}

export function sortCategorySummaryRows(
  rows: SummaryItem[],
  sort: SummarySort
) {
  return [...rows].sort((a, b) => {
    if (sort === "count") return b.count - a.count
    if (sort === "avg") return b.amount / b.count - a.amount / a.count
    return b.amount - a.amount
  })
}

export function sortTagSummaryRows(rows: SummaryItem[], sort: TagSort) {
  return [...rows].sort((a, b) => {
    if (sort === "count") return b.count - a.count
    if (sort === "days") return b.days.size - a.days.size
    return b.amount - a.amount
  })
}

export function sortAccountSummaryRows(rows: SummaryItem[], sort: AccountSort) {
  return [...rows].sort((a, b) => {
    if (sort === "count") return b.count - a.count
    return b.amount - a.amount
  })
}
