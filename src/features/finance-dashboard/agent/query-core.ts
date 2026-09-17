import {
  getDateRange,
  getMonthly,
  getPeriodComparison,
  getStats,
  summarizeBy,
} from "../model/analytics"
import { BASE_CURRENCY, EMPTY_FILTERS } from "../model/constants"
import { dateKey } from "../model/date"
import { filterTransactions, getFilterDateBounds } from "../model/filtering"
import { getEffectiveRate, getMissingRates } from "../model/money"
import { isExpenseTransaction } from "../model/transaction-rules"
import type { Filters, Transaction } from "../model/types"
import type {
  CompareInput,
  GroupInput,
  QueryWhere,
  SummaryInput,
} from "./query-schema"
import {
  queryError,
  type LedgerSnapshot,
  type MissingRateInfo,
  type QueryContext,
  type QueryResult,
  type QueryScope,
} from "./query-types"

const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100
const originalMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 10000) / 10000

function isInvalidDateRange(from?: string, to?: string) {
  return Boolean(from && to && from > to)
}

function sanitizeLabel(value: string) {
  return value.length > 120 ? `${value.slice(0, 119)}…` : value
}

function filterFromWhere(where: QueryWhere): Filters {
  return {
    ...EMPTY_FILTERS,
    startDate: where.from ?? "",
    endDate: where.to ?? "",
    types: where.types ?? [],
    categories: where.categories ?? [],
    currencies: where.currencies ?? [],
    accounts: where.accounts ?? [],
    books: where.books ?? [],
    tags: where.tags ?? [],
    excludedTags: where.excludedTags ?? [],
    keyword: where.keyword ?? "",
  }
}

function nonDateFilters(filters: Filters): Filters {
  return {
    ...filters,
    quickRange: EMPTY_FILTERS.quickRange,
    year: "",
    startDate: "",
    endDate: "",
  }
}

function missingRateInfo(
  rows: readonly Transaction[],
  snapshot: LedgerSnapshot
): MissingRateInfo {
  const missingCurrencies = getMissingRates(rows, snapshot.rates).sort()
  const missingSet = new Set(missingCurrencies)
  const excludedOriginalAmount: Record<string, number> = {}
  let excludedFromConversionCount = 0
  for (const row of rows) {
    if (!missingSet.has(row.currency)) continue
    excludedFromConversionCount += 1
    excludedOriginalAmount[row.currency] =
      (excludedOriginalAmount[row.currency] ?? 0) + Math.abs(row.amount)
  }
  for (const currency of missingCurrencies)
    excludedOriginalAmount[currency] = originalMoney(
      excludedOriginalAmount[currency]
    )
  return {
    conversionStatus: missingCurrencies.length ? "partial" : "complete",
    missingCurrencies,
    excludedFromConversionCount,
    excludedOriginalAmount,
    warnings: missingCurrencies.length
      ? [
          `MISSING_RATE：${missingCurrencies.join("、")} 缺少有效汇率；这些交易计入笔数，人民币折算额按页面口径为 0。当前人民币合计是部分合计；原币金额按绝对值合计。`,
        ]
      : [],
  }
}

function ratesUsed(rows: readonly Transaction[], snapshot: LedgerSnapshot) {
  return Object.fromEntries(
    Array.from(new Set(rows.map((row) => row.currency)))
      .sort()
      .filter((currency) => getEffectiveRate(currency, snapshot.rates) > 0)
      .map((currency) => [currency, getEffectiveRate(currency, snapshot.rates)])
  )
}

function effectiveDateRange(
  snapshot: LedgerSnapshot,
  scope: QueryScope,
  where: QueryWhere | undefined
) {
  const pageBounds =
    scope === "current_view"
      ? getFilterDateBounds(
          snapshot.filters as Filters,
          new Date(snapshot.asOf)
        )
      : { start: null, end: null }
  const from = pageBounds.start ? dateKey(pageBounds.start) : null
  const to = pageBounds.end ? dateKey(pageBounds.end) : null
  return {
    from: where?.from && (!from || where.from > from) ? where.from : from,
    to: where?.to && (!to || where.to < to) ? where.to : to,
  }
}

function makeContext(
  snapshot: LedgerSnapshot,
  rows: readonly Transaction[],
  scope: QueryScope,
  where?: QueryWhere,
  dateRange = effectiveDateRange(snapshot, scope, where),
  pageFilters: Filters | null = scope === "current_view"
    ? (snapshot.filters as Filters)
    : null
): QueryContext {
  return {
    contextId: snapshot.contextId,
    source: "current_page",
    scope,
    filters: pageFilters,
    where: where ?? null,
    effectiveDateRange: dateRange,
    matchedRows: rows.length,
    baseCurrency: BASE_CURRENCY,
    ratesUsed: ratesUsed(rows, snapshot),
    ...missingRateInfo(rows, snapshot),
    asOf: snapshot.asOf,
    timeZone: snapshot.timeZone,
  }
}

function selectRows(
  snapshot: LedgerSnapshot,
  scope: QueryScope,
  where?: QueryWhere
) {
  const base =
    scope === "all_data" ? snapshot.transactions : snapshot.currentViewRows
  return where
    ? filterTransactions(
        base,
        filterFromWhere(where),
        false,
        new Date(snapshot.asOf)
      )
    : [...base]
}

function checkQuery(
  snapshot: LedgerSnapshot,
  expectedContextId: string,
  where?: QueryWhere,
  checkPageDates = true
) {
  if (expectedContextId !== snapshot.contextId)
    return queryError(
      "STALE_CONTEXT",
      "账本、筛选或汇率已变化，请先重新调用 get_ledger_context。"
    )
  if (
    checkPageDates &&
    isInvalidDateRange(snapshot.filters.startDate, snapshot.filters.endDate)
  )
    return queryError("INVALID_FILTER", "页面的起止日期无效。")
  if (isInvalidDateRange(where?.from, where?.to))
    return queryError("INVALID_FILTER", "查询的起止日期无效。")
  return null
}

export function getContext(snapshot: LedgerSnapshot): QueryResult<{
  totalRows: number
  currentViewRows: number
  ledgerDateRange: { from: string; to: string } | null
  currencies: string[]
  rateNote: string
}> {
  const range = getDateRange(snapshot.transactions)
  return {
    ok: true,
    context: makeContext(snapshot, snapshot.currentViewRows, "current_view"),
    data: {
      totalRows: snapshot.transactions.length,
      currentViewRows: snapshot.currentViewRows.length,
      ledgerDateRange: range
        ? { from: dateKey(range.start), to: dateKey(range.end) }
        : null,
      currencies: Array.from(
        new Set(snapshot.transactions.map((row) => row.currency))
      ).sort(),
      rateNote: "汇率为页面当前有效设置，不是实时市场汇率。",
    },
    truncated: false,
  }
}

function summarizeStats(
  rows: readonly Transaction[],
  snapshot: LedgerSnapshot
) {
  const stats = getStats(rows, snapshot.rates as Record<string, number>)
  return {
    totalExpense: money(stats.totalExpense),
    totalIncome: money(stats.totalIncome),
    net: money(stats.net),
    incomeBreakdown: {
      income: money(stats.incomeBreakdown.income),
      refund: money(stats.incomeBreakdown.refund),
      reimburse: money(stats.incomeBreakdown.reimburse),
    },
    count: stats.count,
    expenseCount: stats.expenseCount,
    monthlyExpense: money(stats.monthlyExpense),
    dailyExpense: money(stats.dailyExpense),
    avgExpense: money(stats.avgExpense),
    maxExpense: money(stats.maxExpense),
    reimburse: money(stats.reimburse),
    currencyCount: stats.currencyCount,
    tagCount: stats.tagCount,
    days: stats.days,
    unit: BASE_CURRENCY,
    method:
      "月均按有交易月份、日均按有交易日期、笔均按支出笔数计算；缺汇率金额按页面口径折算为 0。",
  }
}

export function getSummary(
  snapshot: LedgerSnapshot,
  input: SummaryInput
): QueryResult<ReturnType<typeof summarizeStats>> {
  const scope = input.scope ?? "current_view"
  const error = checkQuery(
    snapshot,
    input.expectedContextId,
    input.where,
    scope === "current_view"
  )
  if (error) return error
  const rows = selectRows(snapshot, scope, input.where)
  return {
    ok: true,
    context: makeContext(snapshot, rows, scope, input.where),
    data: summarizeStats(rows, snapshot),
    truncated: false,
  }
}

export function getBreakdown(
  snapshot: LedgerSnapshot,
  input: GroupInput
): QueryResult<{
  dimension: GroupInput["dimension"]
  order: string
  totalGroups: number
  groups: Array<Record<string, unknown>>
  note: string | null
}> {
  const scope = input.scope ?? "current_view"
  const error = checkQuery(
    snapshot,
    input.expectedContextId,
    input.where,
    scope === "current_view"
  )
  if (error) return error
  const rows = selectRows(snapshot, scope, input.where)
  const limit = input.limit ?? 20
  let groups: Array<Record<string, unknown>>
  let order: string
  if (input.dimension === "month") {
    const counts = new Map<string, number>()
    const monthlyRows = new Map<string, Transaction[]>()
    for (const row of rows) {
      counts.set(row.monthKey, (counts.get(row.monthKey) ?? 0) + 1)
      const group = monthlyRows.get(row.monthKey) ?? []
      group.push(row)
      monthlyRows.set(row.monthKey, group)
    }
    const monthly = getMonthly(rows, snapshot.rates as Record<string, number>)
    groups = monthly.reverse().map((item) => ({
      name: item.month,
      count: counts.get(item.month) ?? 0,
      expense: money(item.expense),
      income: money(item.income),
      net: money(item.net),
      ...missingRateInfo(monthlyRows.get(item.month) ?? [], snapshot),
    }))
    order = "month_descending"
  } else {
    const expenseRows =
      input.dimension === "account"
        ? rows.filter((row) => row.account1 && isExpenseTransaction(row))
        : rows.filter(isExpenseTransaction)
    const groupedRows = new Map<string, Transaction[]>()
    const pickName = (row: Transaction) => {
      switch (input.dimension) {
        case "category":
          return row.category
        case "subcategory":
          return row.subcategory
        case "account":
          return row.account1
        case "book":
          return row.book || "未填写"
        case "currency":
          return row.currency
        default:
          return row.category
      }
    }
    for (const row of expenseRows) {
      const names = input.dimension === "tag" ? row.tags : [pickName(row)]
      for (const name of names) {
        const group = groupedRows.get(name) ?? []
        group.push(row)
        groupedRows.set(name, group)
      }
    }
    const summaries = summarizeBy(
      expenseRows,
      snapshot.rates as Record<string, number>,
      pickName,
      input.dimension === "tag"
    )
    groups = summaries.map((item) => {
      return {
        name: sanitizeLabel(item.name),
        count: item.count,
        amount: money(item.amount),
        currency: BASE_CURRENCY,
        ...missingRateInfo(groupedRows.get(item.name) ?? [], snapshot),
      }
    })
    order = "expense_amount_descending"
  }
  return {
    ok: true,
    context: makeContext(snapshot, rows, scope, input.where),
    data: {
      dimension: input.dimension,
      order,
      totalGroups: groups.length,
      groups: groups.slice(0, limit),
      note:
        input.dimension === "tag"
          ? "同一笔支出可有多个标签；标签组之间会重叠，不能相加作为总支出。"
          : null,
    },
    truncated: groups.length > limit,
  }
}

export function comparePeriods(
  snapshot: LedgerSnapshot,
  input: CompareInput
): QueryResult<Record<string, unknown>> {
  const error = checkQuery(
    snapshot,
    input.expectedContextId,
    input.where,
    false
  )
  if (error) return error
  if (
    isInvalidDateRange(input.currentPeriod.from, input.currentPeriod.to) ||
    isInvalidDateRange(input.previousPeriod.from, input.previousPeriod.to)
  )
    return queryError("INVALID_FILTER", "比较期间的起止日期无效。")
  const scope = input.scope ?? "current_view"
  const baseFilters =
    scope === "current_view"
      ? nonDateFilters(snapshot.filters as Filters)
      : EMPTY_FILTERS
  const baseRows = filterTransactions(
    snapshot.transactions,
    baseFilters,
    false,
    new Date(snapshot.asOf)
  )
  const extraRows = input.where
    ? filterTransactions(
        baseRows,
        filterFromWhere(input.where),
        false,
        new Date(snapshot.asOf)
      )
    : baseRows
  const periodRows = (period: { from: string; to: string }) =>
    filterTransactions(
      extraRows,
      { ...EMPTY_FILTERS, startDate: period.from, endDate: period.to },
      false,
      new Date(snapshot.asOf)
    )
  const currentRows = periodRows(input.currentPeriod)
  const previousRows = periodRows(input.previousPeriod)
  const comparison = getPeriodComparison(
    currentRows,
    previousRows,
    `${input.currentPeriod.from} 至 ${input.currentPeriod.to}`,
    `${input.previousPeriod.from} 至 ${input.previousPeriod.to}`,
    snapshot.rates as Record<string, number>
  )
  const combinedRows = [...currentRows, ...previousRows]
  const roundTrend = (trend: {
    current: number
    previous: number
    change: number
    changeRate: number | null
  }) => ({
    current: money(trend.current),
    previous: money(trend.previous),
    change: money(trend.change),
    changeRate:
      trend.changeRate === null
        ? null
        : Math.round(trend.changeRate * 10000) / 10000,
  })
  return {
    ok: true,
    context: makeContext(
      snapshot,
      combinedRows,
      scope,
      input.where,
      { from: null, to: null },
      scope === "current_view" ? baseFilters : null
    ),
    data: {
      canCompare: comparison.canCompare,
      currentPeriod: {
        ...input.currentPeriod,
        matchedRows: currentRows.length,
        ...missingRateInfo(currentRows, snapshot),
      },
      previousPeriod: {
        ...input.previousPeriod,
        matchedRows: previousRows.length,
        ...missingRateInfo(previousRows, snapshot),
      },
      expense: roundTrend(comparison.expense),
      income: roundTrend(comparison.income),
      net: roundTrend(comparison.net),
      categoryExpenseTop: comparison.categoryExpenseTop.map((item) => ({
        name: sanitizeLabel(item.name),
        ...roundTrend(item),
      })),
      tagExpenseTop: comparison.tagExpenseTop.map((item) => ({
        name: sanitizeLabel(item.name),
        ...roundTrend(item),
      })),
      unit: BASE_CURRENCY,
      dateRule:
        scope === "current_view"
          ? "两段明确日期覆盖页面日期筛选，页面其它筛选继续生效；比较结果中的缺汇率金额按页面口径为 0。"
          : "两段明确日期在全账本上比较，不使用页面筛选；比较结果中的缺汇率金额按页面口径为 0。",
    },
    truncated: false,
  }
}
