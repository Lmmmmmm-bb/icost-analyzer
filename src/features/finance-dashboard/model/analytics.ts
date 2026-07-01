import type {
  DailyCashflowItem,
  MetricStats,
  MonthlyItem,
  PeriodComparison,
  PeriodTopMover,
  PeriodTrend,
  SummaryItem,
  WeekItem,
} from "./analytics-types"
import { unique } from "./collections"
import { expenseRmb, toRmb } from "./money"
import {
  getTransactionDirection,
  isExpenseTransaction,
  isIncomeTransaction,
  isReimburseTransaction,
} from "./transaction-rules"
import type { Dimensions, RateMap, Transaction } from "./types"

export function summarizeBy(
  transactions: Transaction[],
  rates: RateMap,
  pickName: (tx: Transaction) => string,
  includeTags = false
): SummaryItem[] {
  const map = new Map<string, SummaryItem>()
  for (const tx of transactions) {
    if (!isExpenseTransaction(tx)) continue

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
  const accounts = transactions.flatMap((tx) => [tx.account1, tx.account2])
  return {
    currencies: unique(transactions.map((tx) => tx.currency)),
    categories: unique(transactions.map((tx) => tx.category)),
    accounts: unique(accounts.filter(Boolean)),
    tags: unique(tags),
    years: unique(
      transactions.map((tx) => String(tx.date.getFullYear()))
    ).reverse(),
  }
}

export function getDateRange(transactions: Transaction[]) {
  if (!transactions.length) return null

  let start = transactions[0].date
  let end = transactions[0].date

  for (const tx of transactions) {
    if (tx.date < start) start = tx.date
    if (tx.date > end) end = tx.date
  }

  return { start, end }
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
    if (isExpenseTransaction(tx)) {
      const expense = Math.abs(rmb)
      totalExpense += expense
      maxExpense = Math.max(maxExpense, expense)
      expenseCount += 1
    }
    if (isIncomeTransaction(tx)) totalIncome += Math.max(rmb, 0)
    if (isReimburseTransaction(tx)) reimburse += Math.abs(rmb)
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
  const categoryMaps = new Map<string, Map<string, number>>()
  for (const tx of filtered) {
    const item = map.get(tx.monthKey) ?? {
      month: tx.monthKey,
      expense: 0,
      income: 0,
      net: 0,
      savingsRate: null,
      topExpenseCategory: {
        name: "暂无支出",
        amount: 0,
      },
      largestExpense: null,
      bills: [],
    }
    const rmb = toRmb(tx, rates)
    const direction = getTransactionDirection(tx)
    item.bills.push({
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
      rmb,
      direction,
    })
    if (isExpenseTransaction(tx)) {
      const expense = expenseRmb(tx, rates)
      const categoryName = tx.category || "未分类"
      const categoryMap =
        categoryMaps.get(tx.monthKey) ?? new Map<string, number>()
      const categoryAmount = (categoryMap.get(categoryName) ?? 0) + expense
      categoryMap.set(categoryName, categoryAmount)
      categoryMaps.set(tx.monthKey, categoryMap)

      item.expense += expense
      if (categoryAmount > item.topExpenseCategory.amount) {
        item.topExpenseCategory = {
          name: categoryName,
          amount: categoryAmount,
        }
      }
      if (!item.largestExpense || expense > item.largestExpense.rmb) {
        item.largestExpense = {
          id: tx.id,
          day: tx.dayKey,
          category: tx.category,
          subcategory: tx.subcategory,
          note: tx.note,
          amount: Math.abs(tx.amount),
          currency: tx.currency,
          rmb: expense,
        }
      }
    }
    if (isIncomeTransaction(tx)) item.income += Math.max(rmb, 0)
    item.net = item.income - item.expense
    item.savingsRate = item.income > 0 ? item.net / item.income : null
    map.set(tx.monthKey, item)
  }
  return Array.from(map.values())
    .map((item) => ({
      ...item,
      bills: [...item.bills].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      ),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function createTrend(current: number, previous: number): PeriodTrend {
  return {
    current,
    previous,
    change: current - previous,
    changeRate: previous === 0 ? null : (current - previous) / previous,
  }
}

function emptyPeriodComparison(): PeriodComparison {
  return {
    canCompare: false,
    currentLabel: "",
    previousLabel: "",
    expense: createTrend(0, 0),
    income: createTrend(0, 0),
    net: createTrend(0, 0),
    categoryExpenseTop: [],
    tagExpenseTop: [],
  }
}

function addExpenseToMap(
  map: Map<string, number>,
  name: string,
  amount: number
) {
  map.set(name, (map.get(name) ?? 0) + amount)
}

function getTopMovers(
  current: Map<string, number>,
  previous: Map<string, number>,
  limit: number
): PeriodTopMover[] {
  const names = new Set([...current.keys(), ...previous.keys()])
  return Array.from(names)
    .map((name) => ({
      name,
      ...createTrend(current.get(name) ?? 0, previous.get(name) ?? 0),
    }))
    .filter((item) => item.current > 0 || item.previous > 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, limit)
}

export function getPeriodComparison(
  currentScope: Transaction[],
  previousScope: Transaction[],
  currentLabel: string,
  previousLabel: string,
  rates: RateMap
): PeriodComparison {
  if (!currentLabel && !previousLabel) return emptyPeriodComparison()

  const currentCategoryExpense = new Map<string, number>()
  const previousCategoryExpense = new Map<string, number>()
  const currentTagExpense = new Map<string, number>()
  const previousTagExpense = new Map<string, number>()
  let currentExpense = 0
  let previousExpense = 0
  let currentIncome = 0
  let previousIncome = 0

  for (const tx of currentScope) {
    const rmb = toRmb(tx, rates)

    if (isExpenseTransaction(tx)) {
      const expense = Math.abs(rmb)
      currentExpense += expense
      addExpenseToMap(currentCategoryExpense, tx.category, expense)
      for (const tag of tx.tags)
        addExpenseToMap(currentTagExpense, tag, expense)
    }

    if (isIncomeTransaction(tx)) {
      const income = Math.max(rmb, 0)
      currentIncome += income
    }
  }

  for (const tx of previousScope) {
    const rmb = toRmb(tx, rates)

    if (isExpenseTransaction(tx)) {
      const expense = Math.abs(rmb)
      previousExpense += expense
      addExpenseToMap(previousCategoryExpense, tx.category, expense)
      for (const tag of tx.tags)
        addExpenseToMap(previousTagExpense, tag, expense)
    }

    if (isIncomeTransaction(tx)) {
      previousIncome += Math.max(rmb, 0)
    }
  }

  return {
    canCompare: previousScope.length > 0,
    currentLabel,
    previousLabel,
    expense: createTrend(currentExpense, previousExpense),
    income: createTrend(currentIncome, previousIncome),
    net: createTrend(
      currentIncome - currentExpense,
      previousIncome - previousExpense
    ),
    categoryExpenseTop: getTopMovers(
      currentCategoryExpense,
      previousCategoryExpense,
      5
    ),
    tagExpenseTop: getTopMovers(currentTagExpense, previousTagExpense, 5),
  }
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
    if (isExpenseTransaction(tx)) item.expense += Math.abs(rmb)
    if (isIncomeTransaction(tx)) item.income += Math.max(rmb, 0)
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
      direction: getTransactionDirection(tx),
    })
    map.set(tx.dayKey, item)
  }
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day))
}

export function getWeekSummary(filtered: Transaction[], rates: RateMap) {
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

export function getHeatmap(filtered: Transaction[], rates: RateMap) {
  const map = new Map<string, number>()
  for (const tx of filtered) {
    if (!isExpenseTransaction(tx)) continue

    map.set(tx.dayKey, (map.get(tx.dayKey) ?? 0) + expenseRmb(tx, rates))
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}
