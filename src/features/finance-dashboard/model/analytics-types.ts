export type SummaryItem = {
  name: string
  count: number
  amount: number
  days: Set<string>
}

export type PeriodTrend = {
  current: number
  previous: number
  change: number
  changeRate: number | null
}

export type PeriodTopMover = PeriodTrend & {
  name: string
}

export type PeriodComparison = {
  canCompare: boolean
  currentLabel: string
  previousLabel: string
  expense: PeriodTrend
  income: PeriodTrend
  net: PeriodTrend
  categoryExpenseTop: PeriodTopMover[]
  tagExpenseTop: PeriodTopMover[]
}

export type MetricStats = {
  totalExpense: number
  totalIncome: number
  net: number
  count: number
  monthlyExpense: number
  dailyExpense: number
  avgExpense: number
  maxExpense: number
  reimburse: number
  currencyCount: number
  tagCount: number
  expenseCount: number
  days: number
}

export type MonthlyItem = {
  month: string
  expense: number
  income: number
  net: number
  savingsRate: number | null
  topExpenseCategory: {
    name: string
    amount: number
  }
  largestExpense: MonthlyLargestExpense | null
  bills: MonthlyBillItem[]
}

export type MonthlyLargestExpense = {
  id: string
  day: string
  category: string
  subcategory: string
  note: string
  amount: number
  currency: string
  rmb: number
}

export type MonthlyBillItem = {
  id: string
  date: Date
  dateText: string
  type: string
  category: string
  subcategory: string
  note: string
  tags: string[]
  location: string
  amount: number
  currency: string
  rmb: number
  direction: "expense" | "income" | "other"
}

export type DailyCashflowItem = {
  day: string
  date: Date
  expense: number
  income: number
  net: number
  count: number
  bills: DailyBillItem[]
}

export type DailyBillItem = {
  id: string
  type: string
  category: string
  subcategory: string
  note: string
  tags: string[]
  location: string
  amount: number
  currency: string
  rmb: number
  direction: "expense" | "income" | "other"
}

export type WeekItem = {
  name: string
  amount: number
}
