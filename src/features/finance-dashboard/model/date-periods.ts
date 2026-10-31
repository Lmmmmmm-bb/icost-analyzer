import { dateKey } from "./date"
import type { DateBounds } from "./time-filter"

type DatePeriod = {
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
  bounds: DateBounds,
  dataRange: { start: Date; end: Date } | null
): DatePeriod | null {
  if (!bounds.valid) return null
  const start = bounds.start ?? dataRange?.start
  const end = bounds.end ?? dataRange?.end
  return start && end ? createDatePeriod(start, end) : null
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
