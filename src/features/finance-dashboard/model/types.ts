type TransactionType =
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
  account1: string
  account2: string
  book: string
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
  accounts: string[]
  books: string[]
  tags: string[]
  excludedTags: string[]
  keyword: string
}

export type RateMap = Record<string, number>

export type Dimensions = {
  currencies: string[]
  categories: string[]
  accounts: string[]
  books: string[]
  tags: string[]
  years: string[]
}
