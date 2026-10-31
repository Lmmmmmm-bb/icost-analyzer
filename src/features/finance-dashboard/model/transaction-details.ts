import type { MonthlySummary } from "./analytics-types"
import { expenseRmb, toRmb } from "./money"
import {
  getTransactionDirection,
  isExpenseTransaction,
  type TransactionDirection,
} from "./transaction-rules"
import type { RateMap, Transaction } from "./types"

export type TransactionDetail = Pick<
  Transaction,
  | "id"
  | "date"
  | "dateText"
  | "type"
  | "category"
  | "subcategory"
  | "note"
  | "tags"
  | "location"
  | "amount"
  | "currency"
> & {
  rmb: number
  direction: TransactionDirection
}

export type MonthlyLargestExpense = Pick<
  Transaction,
  "id" | "category" | "subcategory" | "note" | "currency" | "amount"
> & { day: string; rmb: number }

export type MonthlyReviewItem = MonthlySummary & {
  topExpenseCategory: { name: string; amount: number }
  largestExpense: MonthlyLargestExpense | null
}

export type TransactionDetailQueries = {
  monthlyReview: () => MonthlyReviewItem[]
  month: (month: string) => TransactionDetail[]
  day: (day: string) => TransactionDetail[]
}

function projectDetail(tx: Transaction, rates: RateMap): TransactionDetail {
  return {
    id: tx.id,
    date: tx.date,
    dateText: tx.dateText,
    type: tx.type,
    category: tx.category,
    subcategory: tx.subcategory,
    note: tx.note,
    tags: tx.tags,
    location: tx.location,
    amount: tx.amount,
    currency: tx.currency,
    rmb: toRmb(tx, rates),
    direction: getTransactionDirection(tx),
  }
}

export function selectMonthDetails(
  rows: readonly Transaction[],
  rates: RateMap,
  month: string
) {
  return rows
    .filter((tx) => tx.monthKey === month)
    .map((tx) => projectDetail(tx, rates))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function selectDayDetails(
  rows: readonly Transaction[],
  rates: RateMap,
  day: string
) {
  return rows
    .filter((tx) => tx.dayKey === day)
    .map((tx) => projectDetail(tx, rates))
}

/** Only called when the monthly review is open; never builds full bill lists. */
export function selectMonthlyReview(
  rows: readonly Transaction[],
  rates: RateMap,
  monthly: readonly MonthlySummary[]
): MonthlyReviewItem[] {
  const reviews = new Map<string, MonthlyReviewItem>(
    monthly.map((item) => [
      item.month,
      {
        ...item,
        topExpenseCategory: { name: "暂无支出", amount: 0 },
        largestExpense: null,
      },
    ])
  )
  const categories = new Map<string, Map<string, number>>()
  for (const tx of rows) {
    if (!isExpenseTransaction(tx)) continue
    const item = reviews.get(tx.monthKey)
    if (!item) continue
    const amount = expenseRmb(tx, rates)
    const category = tx.category || "未分类"
    const totals = categories.get(tx.monthKey) ?? new Map<string, number>()
    const total = (totals.get(category) ?? 0) + amount
    totals.set(category, total)
    categories.set(tx.monthKey, totals)
    if (total > item.topExpenseCategory.amount)
      item.topExpenseCategory = { name: category, amount: total }
    if (!item.largestExpense || amount > item.largestExpense.rmb) {
      item.largestExpense = {
        id: tx.id,
        day: tx.dayKey,
        category: tx.category,
        subcategory: tx.subcategory,
        note: tx.note,
        amount: Math.abs(tx.amount),
        currency: tx.currency,
        rmb: amount,
      }
    }
  }
  return [...reviews.values()]
}
