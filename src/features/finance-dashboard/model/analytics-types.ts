export type SummaryItem = {
  name: string
  count: number
  amount: number
  days: Set<string>
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
}

export type WeekItem = {
  name: string
  amount: number
}
