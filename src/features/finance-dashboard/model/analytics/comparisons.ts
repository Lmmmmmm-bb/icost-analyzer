import type {
  PeriodComparison,
  PeriodTopMover,
  PeriodTrend,
} from "../analytics-types"
import { toRmb } from "../money"
import { isExpenseTransaction, isIncomeTransaction } from "../transaction-rules"
import type { RateMap, Transaction } from "../types"

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
  currentScope: readonly Transaction[],
  previousScope: readonly Transaction[],
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
