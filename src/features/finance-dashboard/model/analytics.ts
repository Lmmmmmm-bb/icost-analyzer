import type {
  DailyCashflowItem,
  MetricStats,
  MonthlyItem,
  SummaryItem,
  WeekItem,
} from "./analytics-types"
import { unique } from "./collections"
import { expenseRmb, toRmb } from "./money"
import type { Dimensions, RateMap, Transaction } from "./types"

function isExpense(tx: Transaction) {
  return tx.type === "支出" || tx.amount < 0
}

function isIncome(tx: Transaction) {
  return (
    ["收入", "退款入账", "报销入账"].includes(tx.type) && tx.type !== "转账"
  )
}

function isReimburse(tx: Transaction) {
  return ["退款入账", "报销入账", "已报销", "待报销"].includes(tx.type)
}

export function summarizeBy(
  transactions: Transaction[],
  rates: RateMap,
  pickName: (tx: Transaction) => string,
  includeTags = false
): SummaryItem[] {
  const map = new Map<string, SummaryItem>()
  for (const tx of transactions.filter(isExpense)) {
    const names = includeTags ? tx.tags : [pickName(tx)]
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

export function getDimensions(transactions: Transaction[]): Dimensions {
  const tags = transactions.flatMap((tx) => tx.tags)
  return {
    currencies: unique(transactions.map((tx) => tx.currency)),
    categories: unique(transactions.map((tx) => tx.category)),
    tags: unique(tags),
    years: unique(
      transactions.map((tx) => String(tx.date.getFullYear()))
    ).reverse(),
  }
}

export function getDateRange(transactions: Transaction[]) {
  if (!transactions.length) return null
  const sorted = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )
  return { start: sorted[0].date, end: sorted[sorted.length - 1].date }
}

export function getStats(filtered: Transaction[], rates: RateMap): MetricStats {
  let totalExpense = 0
  let totalIncome = 0
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
    if (isExpense(tx)) {
      const expense = Math.abs(rmb)
      totalExpense += expense
      maxExpense = Math.max(maxExpense, expense)
      expenseCount += 1
    }
    if (isIncome(tx)) totalIncome += Math.max(rmb, 0)
    if (isReimburse(tx)) reimburse += Math.abs(rmb)
  }

  const months = monthSet.size || 1
  const days = daySet.size || 1
  return {
    totalExpense,
    totalIncome,
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

export function getMonthly(filtered: Transaction[], rates: RateMap) {
  const map = new Map<string, MonthlyItem>()
  for (const tx of filtered) {
    const item = map.get(tx.monthKey) ?? {
      month: tx.monthKey,
      expense: 0,
      income: 0,
      net: 0,
    }
    if (isExpense(tx)) item.expense += expenseRmb(tx, rates)
    if (isIncome(tx)) item.income += Math.max(toRmb(tx, rates), 0)
    item.net = item.income - item.expense
    map.set(tx.monthKey, item)
  }
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
}

export function getDailyCashflow(
  filtered: Transaction[],
  rates: RateMap
): DailyCashflowItem[] {
  const map = new Map<string, DailyCashflowItem>()
  for (const tx of filtered) {
    const item = map.get(tx.dayKey) ?? {
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
      bills: [],
    }
    const rmb = toRmb(tx, rates)
    if (isExpense(tx)) item.expense += Math.abs(rmb)
    if (isIncome(tx)) item.income += Math.max(rmb, 0)
    item.net = item.income - item.expense
    item.count += 1
    item.bills.push({
      id: tx.id,
      type: tx.type,
      category: tx.category,
      subcategory: tx.subcategory,
      note: tx.note,
      tags: tx.tags,
      location: tx.location,
      amount: tx.amount,
      currency: tx.currency,
      rmb,
      direction: isExpense(tx) ? "expense" : isIncome(tx) ? "income" : "other",
    })
    map.set(tx.dayKey, item)
  }
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day))
}

export function getWeekSummary(filtered: Transaction[], rates: RateMap) {
  const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  const amounts = Array.from({ length: 7 }, () => 0)
  for (const tx of filtered.filter(isExpense)) {
    const index = (tx.date.getDay() + 6) % 7
    amounts[index] += expenseRmb(tx, rates)
  }
  return labels.map(
    (name, index): WeekItem => ({ name, amount: amounts[index] })
  )
}

export function getHeatmap(filtered: Transaction[], rates: RateMap) {
  const map = new Map<string, number>()
  for (const tx of filtered.filter(isExpense)) {
    map.set(tx.dayKey, (map.get(tx.dayKey) ?? 0) + expenseRmb(tx, rates))
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}
