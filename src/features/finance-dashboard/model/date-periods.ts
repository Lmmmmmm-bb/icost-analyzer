import { ALL_RANGE } from "./constants"
import { dateKey } from "./date"
import type { Filters, Transaction } from "./types"

export type DatePeriod = {
  start: Date
  end: Date
  label: string
}

const RANGE_ARROW = "→"

function normalizeStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function normalizeEnd(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )
}

function formatPeriodLabel(start: Date, end: Date) {
  const startKey = dateKey(start)
  const endKey = dateKey(end)
  return startKey === endKey ? startKey : `${startKey} ${RANGE_ARROW} ${endKey}`
}

function createDatePeriod(start: Date, end: Date): DatePeriod {
  const normalizedStart = normalizeStart(start)
  const normalizedEnd = normalizeEnd(end)
  return {
    start: normalizedStart,
    end: normalizedEnd,
    label: formatPeriodLabel(normalizedStart, normalizedEnd),
  }
}

export function getCurrentDatePeriod(
  filters: Filters,
  filtered: Transaction[],
  dataRange: { start: Date; end: Date } | null
): DatePeriod | null {
  if (filters.startDate || filters.endDate) {
    const start = filters.startDate
      ? new Date(`${filters.startDate}T00:00:00`)
      : dataRange?.start
    const end = filters.endDate
      ? new Date(`${filters.endDate}T23:59:59`)
      : dataRange?.end
    return start && end ? createDatePeriod(start, end) : null
  }

  if (filters.year) {
    return createDatePeriod(
      new Date(`${filters.year}-01-01T00:00:00`),
      new Date(`${filters.year}-12-31T23:59:59`)
    )
  }

  if (filters.quickRange !== ALL_RANGE) {
    const now = new Date()
    if (filters.quickRange === "今年") {
      return createDatePeriod(
        new Date(`${now.getFullYear()}-01-01T00:00:00`),
        now
      )
    }

    const months = Number(filters.quickRange.match(/\d+/)?.[0] ?? 0)
    const start = new Date(now)
    start.setMonth(start.getMonth() - months)
    return createDatePeriod(start, now)
  }

  const filteredRange = filtered.length ? dataRange : null
  return filteredRange
    ? createDatePeriod(filteredRange.start, filteredRange.end)
    : null
}

export function getPreviousDatePeriod(period: DatePeriod): DatePeriod {
  const periodLength = period.end.getTime() - period.start.getTime()
  const previousEnd = new Date(period.start.getTime() - 1)
  const previousStart = new Date(previousEnd.getTime() - periodLength)
  return createDatePeriod(previousStart, previousEnd)
}

export function getYearOverYearDatePeriod(period: DatePeriod): DatePeriod {
  const previousYearStart = new Date(period.start)
  const previousYearEnd = new Date(period.end)
  previousYearStart.setFullYear(previousYearStart.getFullYear() - 1)
  previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1)
  return createDatePeriod(previousYearStart, previousYearEnd)
}
