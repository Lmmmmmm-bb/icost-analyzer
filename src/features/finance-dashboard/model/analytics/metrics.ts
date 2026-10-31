import type { MetricStats } from "../analytics-types"
import { toRmb } from "../money"
import {
  isExpenseTransaction,
  isIncomeTransaction,
  isReimburseTransaction,
} from "../transaction-rules"
import type { RateMap, Transaction } from "../types"

export function getStats(
  filtered: readonly Transaction[],
  rates: RateMap
): MetricStats {
  let totalExpense = 0
  let totalIncome = 0
  let income = 0
  let refundIncome = 0
  let reimburseIncome = 0
  let reimburse = 0
  let maxExpense = 0
  let expenseCount = 0
  const monthSet = new Set<string>()
  const daySet = new Set<string>()
  const currencySet = new Set<string>()
  const tagSet = new Set<string>()

  for (const tx of filtered) {
    const rmb = toRmb(tx, rates)
    monthSet.add(tx.monthKey)
    daySet.add(tx.dayKey)
    currencySet.add(tx.currency)
    tx.tags.forEach((tag) => tagSet.add(tag))
    if (isExpenseTransaction(tx)) {
      const expense = Math.abs(rmb)
      totalExpense += expense
      maxExpense = Math.max(maxExpense, expense)
      expenseCount += 1
    }
    if (isIncomeTransaction(tx)) {
      const incomeAmount = Math.max(rmb, 0)
      totalIncome += incomeAmount
      if (tx.type === "退款入账") refundIncome += incomeAmount
      else if (tx.type === "报销入账") reimburseIncome += incomeAmount
      else income += incomeAmount
    }
    if (isReimburseTransaction(tx)) reimburse += Math.abs(rmb)
  }

  const months = monthSet.size || 1
  const days = daySet.size || 1
  return {
    totalExpense,
    totalIncome,
    incomeBreakdown: {
      income,
      refund: refundIncome,
      reimburse: reimburseIncome,
    },
    net: totalIncome - totalExpense,
    count: filtered.length,
    monthlyExpense: totalExpense / months,
    dailyExpense: totalExpense / days,
    avgExpense: totalExpense / (expenseCount || 1),
    maxExpense,
    reimburse,
    currencyCount: currencySet.size,
    tagCount: tagSet.size,
    expenseCount,
    days,
  }
}
