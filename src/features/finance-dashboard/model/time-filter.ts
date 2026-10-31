import { parseDateKey } from "./date"
import type { TimeFilter } from "./filters"

export type DateBounds = {
  start: Date | null
  end: Date | null
  valid: boolean
}

function endOfDay(date: Date) {
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

/** A single clock is supplied by the page context or agent query snapshot. */
export function resolveTimeFilter(time: TimeFilter, now: Date): DateBounds {
  switch (time.kind) {
    case "all":
      return { start: null, end: null, valid: true }
    case "custom": {
      const start = time.from ? (parseDateKey(time.from) ?? null) : null
      const endDate = time.to ? (parseDateKey(time.to) ?? null) : null
      const end = endDate ? endOfDay(endDate) : null
      const valid = !(
        (time.from && !start) ||
        (time.to && !end) ||
        (start && end && start > end)
      )
      return { start, end, valid }
    }
    case "year":
      return {
        start: new Date(time.year, 0, 1),
        end: endOfDay(new Date(time.year, 11, 31)),
        valid:
          Number.isInteger(time.year) && time.year >= 1900 && time.year <= 2100,
      }
    case "year-to-date":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
        valid: Number.isFinite(now.getTime()),
      }
    case "rolling-months": {
      const start = new Date(now)
      // Preserve the existing local-calendar month-end rollover behavior.
      start.setMonth(start.getMonth() - time.months)
      return { start, end: now, valid: Number.isFinite(now.getTime()) }
    }
  }
}
