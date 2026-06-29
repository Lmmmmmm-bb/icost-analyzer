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
