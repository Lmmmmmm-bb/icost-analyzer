import type { Filters, RateMap, Transaction } from "../model/types"
import type { MetricStats, PeriodComparison } from "../model/analytics-types"
import type { QueryFilters } from "./query-filters"
import type { GroupInput, QueryWhere } from "./query-schema"

export type QueryScope = "current_view" | "all_data"

export type LedgerSnapshot = Readonly<{
  contextId: string
  transactions: readonly Transaction[]
  currentViewRows: readonly Transaction[]
  filters: Readonly<Filters>
  rates: Readonly<RateMap>
  asOf: string
  timeZone: string
  uploadEpoch: number
}>

export type QueryErrorCode =
  | "DISABLED"
  | "NO_DATA"
  | "PARSING"
  | "STALE_CONTEXT"
  | "INVALID_FILTER"
  | "TOO_LARGE"

export type QueryError = {
  ok: false
  error: {
    code: QueryErrorCode
    message: string
    details?: string
  }
}

export type MissingRateInfo = {
  conversionStatus: "complete" | "partial"
  missingCurrencies: string[]
  excludedFromConversionCount: number
  excludedOriginalAmount: Record<string, number>
  warnings: string[]
}

export type QueryContext = MissingRateInfo & {
  contextId: string
  source: "current_page"
  scope: QueryScope
  filters: QueryFilters | null
  where: QueryWhere | null
  effectiveDateRange: { from: string | null; to: string | null }
  matchedRows: number
  baseCurrency: "CNY"
  ratesUsed: Record<string, number>
  asOf: string
  timeZone: string
}

export type QuerySuccess<T> = {
  ok: true
  context: QueryContext
  data: T
  truncated: boolean
}

export type QueryResult<T> = QuerySuccess<T> | QueryError

export type LedgerContextData = {
  totalRows: number
  currentViewRows: number
  ledgerDateRange: { from: string; to: string } | null
  currencies: string[]
  rateNote: string
}

export type SummaryData = MetricStats & { unit: "CNY"; method: string }

export type MonthlyGroup = MissingRateInfo & {
  name: string
  count: number
  expense: number
  income: number
  net: number
}

export type ExpenseGroup = MissingRateInfo & {
  name: string
  count: number
  amount: number
  currency: "CNY"
}

export type BreakdownData = {
  totalGroups: number
  note: string | null
} & (
  | { dimension: "month"; order: "month_descending"; groups: MonthlyGroup[] }
  | {
      dimension: Exclude<GroupInput["dimension"], "month">
      order: "expense_amount_descending"
      groups: ExpenseGroup[]
    }
)

type ComparisonPeriod = MissingRateInfo & {
  from: string
  to: string
  matchedRows: number
}

export type ComparisonData = Omit<
  PeriodComparison,
  "currentLabel" | "previousLabel"
> & {
  currentPeriod: ComparisonPeriod
  previousPeriod: ComparisonPeriod
  unit: "CNY"
  dateRule: string
}

export function queryError(
  code: QueryErrorCode,
  message: string,
  details?: string
): QueryError {
  return {
    ok: false,
    error: { code, message, ...(details ? { details } : {}) },
  }
}
