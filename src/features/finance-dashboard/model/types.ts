import type { EChartsOption } from "echarts"

export type TransactionType =
  | "支出"
  | "收入"
  | "退款入账"
  | "报销入账"
  | "已报销"
  | "待报销"
  | "转账"
  | string

export type Transaction = {
  id: string
  date: Date
  dateText: string
  dayKey: string
  monthKey: string
  type: TransactionType
  amount: number
  currency: string
  category: string
  subcategory: string
  note: string
  tags: string[]
  location: string
}

export type Filters = {
  quickRange: string
  year: string
  startDate: string
  endDate: string
  types: string[]
  currencies: string[]
  categories: string[]
  tags: string[]
  keyword: string
}

export type RateMap = Record<string, number>

export type Dimensions = {
  currencies: string[]
  categories: string[]
  tags: string[]
  years: string[]
}

export type DateRange = {
  start: Date
  end: Date
} | null

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

export type ChartOptions = {
  monthlyOption: EChartsOption
  pieOption: EChartsOption
  rankingOption: EChartsOption
  currencyOption: EChartsOption
  weekOption: EChartsOption
  tagOption: EChartsOption
  heatmapOption: EChartsOption
}

export type RankLevel = "一级分类" | "二级分类"
export type SummarySort = "amount" | "count" | "avg"
export type TagSort = "amount" | "count" | "days"
export type DetailSort = "date" | "amount"
