import * as XLSX from "xlsx"

import { ALL_RANGE, BASE_CURRENCY } from "./constants"
import type {
  Filters,
  MetricStats,
  MonthlyItem,
  RateMap,
  SummaryItem,
  Transaction,
  WeekItem,
} from "./types"

export function getCell(row: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = row[name]
    if (value !== undefined && value !== null) return String(value).trim()
  }
  return ""
}

export function parseDate(value: string) {
  const normalized = value.replaceAll("/", "-")
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function formatDateTime(date: Date) {
  return `${dateKey(date)} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`
}

export function formatMoney(value: number, compact = false) {
  const abs = Math.abs(value)
  if (compact && abs >= 10000) return `¥${(value / 10000).toFixed(1)} 万`
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: BASE_CURRENCY,
    maximumFractionDigits: abs >= 1000 ? 0 : 2,
  }).format(value)
}

export function splitTags(raw: string) {
  return raw
    .split(/[，,、;；|\s]+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag && !/^(?:19|20)\d{2}年?$/.test(tag))
}

export function isExpense(tx: Transaction) {
  return tx.type === "支出" || tx.amount < 0
}

export function isIncome(tx: Transaction) {
  return (
    ["收入", "退款入账", "报销入账"].includes(tx.type) && tx.type !== "转账"
  )
}

export function isReimburse(tx: Transaction) {
  return ["退款入账", "报销入账", "已报销", "待报销"].includes(tx.type)
}

export function toRmb(tx: Transaction, rates: RateMap) {
  return tx.amount * (rates[tx.currency] ?? 0)
}

export function expenseRmb(tx: Transaction, rates: RateMap) {
  return Math.abs(toRmb(tx, rates))
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items)).sort((a, b) =>
    String(a).localeCompare(String(b), "zh-CN")
  )
}

export function summarizeBy(
  transactions: Transaction[],
  rates: RateMap,
  pickName: (tx: Transaction) => string,
  includeTags = false
): SummaryItem[] {
  const map = new Map<string, SummaryItem>()
  for (const tx of transactions.filter(isExpense)) {
    const names = includeTags ? tx.tags : [pickName(tx)]
    for (const name of names) {
      const item = map.get(name) ?? {
        name,
        count: 0,
        amount: 0,
        days: new Set<string>(),
      }
      item.count += 1
      item.amount += expenseRmb(tx, rates)
      item.days.add(tx.dayKey)
      map.set(name, item)
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
}

export function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function parseWorkbook(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  })
  return rows.flatMap((row, index): Transaction[] => {
    const rawDate = getCell(row, ["日期", "日期时间", "时间"])
    const date = parseDate(rawDate)
    const amount = Number(
      getCell(row, ["金额", "原始金额"]).replaceAll(",", "")
    )
    if (!date || !Number.isFinite(amount)) return []
    const tags = splitTags(getCell(row, ["标签", "Tags"]))
    return [
      {
        id: `${rawDate}-${index}`,
        date,
        dateText: formatDateTime(date),
        dayKey: dateKey(date),
        monthKey: monthKey(date),
        type:
          getCell(row, ["类型", "交易类型"]) || (amount < 0 ? "支出" : "收入"),
        amount,
        currency: (
          getCell(row, ["货币", "币种", "Currency"]) || BASE_CURRENCY
        ).toUpperCase(),
        category: getCell(row, ["一级分类", "分类"]) || "未分类",
        subcategory: getCell(row, ["二级分类", "子分类"]) || "未分类",
        note: getCell(row, ["备注", "说明"]),
        tags,
        location: getCell(row, ["位置", "地点"]),
      },
    ]
  })
}

export function selectClassName() {
  return "h-8 rounded-none border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
}

export function getDimensions(transactions: Transaction[]) {
  const tags = transactions.flatMap((tx) => tx.tags)
  return {
    currencies: unique(transactions.map((tx) => tx.currency)),
    categories: unique(transactions.map((tx) => tx.category)),
    tags: unique(tags),
    years: unique(
      transactions.map((tx) => String(tx.date.getFullYear()))
    ).reverse(),
  }
}

export function getDateRange(transactions: Transaction[]) {
  if (!transactions.length) return null
  const sorted = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )
  return { start: sorted[0].date, end: sorted[sorted.length - 1].date }
}

export function filterTransactions(
  transactions: Transaction[],
  filters: Filters,
  invalidDateRange: boolean
) {
  if (invalidDateRange) return []
  const now = new Date()
  let start: Date | null = filters.startDate
    ? new Date(filters.startDate)
    : null
  let end: Date | null = filters.endDate
    ? new Date(`${filters.endDate}T23:59:59`)
    : null

  if (!start && !end && filters.year) {
    start = new Date(`${filters.year}-01-01T00:00:00`)
    end = new Date(`${filters.year}-12-31T23:59:59`)
  } else if (!start && !end && filters.quickRange !== ALL_RANGE) {
    if (filters.quickRange === "今年") {
      start = new Date(`${now.getFullYear()}-01-01T00:00:00`)
    } else {
      const months = Number(filters.quickRange.match(/\d+/)?.[0] ?? 0)
      start = new Date(now)
      start.setMonth(start.getMonth() - months)
    }
    end = now
  }

  const keyword = filters.keyword.trim().toLowerCase()
  const typeSet = filters.types.length ? new Set(filters.types) : null
  const currencySet = filters.currencies.length
    ? new Set(filters.currencies)
    : null
  const categorySet = filters.categories.length
    ? new Set(filters.categories)
    : null
  const tagSet = filters.tags.length ? new Set(filters.tags) : null
  return transactions.filter((tx) => {
    const matchesKeyword = keyword
      ? [
          tx.note,
          tx.category,
          tx.subcategory,
          tx.tags.join(" "),
          tx.location,
          tx.currency,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      : true
    return (
      (!start || tx.date >= start) &&
      (!end || tx.date <= end) &&
      (!typeSet || typeSet.has(tx.type)) &&
      (!currencySet || currencySet.has(tx.currency)) &&
      (!categorySet || categorySet.has(tx.category)) &&
      (!tagSet || tx.tags.some((tag) => tagSet.has(tag))) &&
      matchesKeyword
    )
  })
}

export function getStats(filtered: Transaction[], rates: RateMap): MetricStats {
  let totalExpense = 0
  let totalIncome = 0
  let reimburse = 0
  let maxExpense = 0
  let expenseCount = 0
  const daySet = new Set<string>()
  const currencySet = new Set<string>()
  const tagSet = new Set<string>()

  for (const tx of filtered) {
    const rmb = toRmb(tx, rates)
    daySet.add(tx.dayKey)
    currencySet.add(tx.currency)
    tx.tags.forEach((tag) => tagSet.add(tag))
    if (isExpense(tx)) {
      const expense = Math.abs(rmb)
      totalExpense += expense
      maxExpense = Math.max(maxExpense, expense)
      expenseCount += 1
    }
    if (isIncome(tx)) totalIncome += Math.max(rmb, 0)
    if (isReimburse(tx)) reimburse += Math.abs(rmb)
  }

  const days = daySet.size || 1
  return {
    totalExpense,
    totalIncome,
    net: totalIncome - totalExpense,
    count: filtered.length,
    dailyExpense: totalExpense / days,
    avgExpense: totalExpense / (expenseCount || 1),
    maxExpense,
    reimburse,
    currencyCount: currencySet.size,
    tagCount: tagSet.size,
    expenseCount,
    days,
  }
}

export function getMonthly(filtered: Transaction[], rates: RateMap) {
  const map = new Map<string, MonthlyItem>()
  for (const tx of filtered) {
    const item = map.get(tx.monthKey) ?? {
      month: tx.monthKey,
      expense: 0,
      income: 0,
      net: 0,
    }
    if (isExpense(tx)) item.expense += expenseRmb(tx, rates)
    if (isIncome(tx)) item.income += Math.max(toRmb(tx, rates), 0)
    item.net = item.income - item.expense
    map.set(tx.monthKey, item)
  }
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
}

export function getWeekSummary(filtered: Transaction[], rates: RateMap) {
  const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  const amounts = Array.from({ length: 7 }, () => 0)
  for (const tx of filtered.filter(isExpense)) {
    const index = (tx.date.getDay() + 6) % 7
    amounts[index] += expenseRmb(tx, rates)
  }
  return labels.map(
    (name, index): WeekItem => ({ name, amount: amounts[index] })
  )
}

export function getHeatmap(filtered: Transaction[], rates: RateMap) {
  const map = new Map<string, number>()
  for (const tx of filtered.filter(isExpense)) {
    map.set(tx.dayKey, (map.get(tx.dayKey) ?? 0) + expenseRmb(tx, rates))
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}

export function makeRateInputs(rates: RateMap) {
  return Object.fromEntries(
    Object.entries(rates).map(([key, value]) => [key, String(value)])
  )
}
