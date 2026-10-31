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
  incomeBreakdown: {
    income: number
    refund: number
    reimburse: number
  }
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

export type MonthlySummary = {
  month: string
  expense: number
  income: number
  net: number
  count: number
  savingsRate: number | null
}

export type DailySummary = {
  day: string
  date: Date
  expense: number
  income: number
  net: number
  count: number
}

export type WeekItem = { name: string; amount: number }
export type HeatmapEntry = [day: string, amount: number]
