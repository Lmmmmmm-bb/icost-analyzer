import type { DailySummary, MonthlySummary, WeekItem } from "../analytics-types"
import { expenseRmb, toRmb } from "../money"
import { isExpenseTransaction, isIncomeTransaction } from "../transaction-rules"
import type { RateMap, Transaction } from "../types"

export function getMonthlySummary(
  rows: readonly Transaction[],
  rates: RateMap
): MonthlySummary[] {
  const months = new Map<string, MonthlySummary>()
  for (const tx of rows) {
    const item = months.get(tx.monthKey) ?? {
      month: tx.monthKey,
      expense: 0,
      income: 0,
      net: 0,
      count: 0,
      savingsRate: null,
    }
    const amount = toRmb(tx, rates)
    if (isExpenseTransaction(tx)) item.expense += Math.abs(amount)
    if (isIncomeTransaction(tx)) item.income += Math.max(amount, 0)
    item.count += 1
    item.net = item.income - item.expense
    item.savingsRate = item.income > 0 ? item.net / item.income : null
    months.set(tx.monthKey, item)
  }
  return [...months.values()].sort((a, b) => a.month.localeCompare(b.month))
}

export function getDailySummary(
  rows: readonly Transaction[],
  rates: RateMap
): DailySummary[] {
  const days = new Map<string, DailySummary>()
  for (const tx of rows) {
    const item = days.get(tx.dayKey) ?? {
      day: tx.dayKey,
      date: new Date(
        tx.date.getFullYear(),
        tx.date.getMonth(),
        tx.date.getDate()
      ),
      expense: 0,
      income: 0,
      net: 0,
      count: 0,
    }
    const amount = toRmb(tx, rates)
    if (isExpenseTransaction(tx)) item.expense += Math.abs(amount)
    if (isIncomeTransaction(tx)) item.income += Math.max(amount, 0)
    item.count += 1
    item.net = item.income - item.expense
    days.set(tx.dayKey, item)
  }
  return [...days.values()].sort((a, b) => a.day.localeCompare(b.day))
}

export function getWeekSummary(
  filtered: readonly Transaction[],
  rates: RateMap
) {
  const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  const amounts = Array.from({ length: 7 }, () => 0)
  for (const tx of filtered) {
    if (!isExpenseTransaction(tx)) continue

    const index = (tx.date.getDay() + 6) % 7
    amounts[index] += expenseRmb(tx, rates)
  }
  return labels.map(
    (name, index): WeekItem => ({ name, amount: amounts[index] })
  )
}

export function getHeatmap(filtered: readonly Transaction[], rates: RateMap) {
  const map = new Map<string, number>()
  for (const tx of filtered) {
    if (!isExpenseTransaction(tx)) continue

    map.set(tx.dayKey, (map.get(tx.dayKey) ?? 0) + expenseRmb(tx, rates))
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}
