import type { Filters, RateMap, Transaction } from "../model/types"
import type { QueryWhere } from "./query-schema"

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
  filters: Filters | null
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
