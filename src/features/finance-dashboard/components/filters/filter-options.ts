import type { TimeFilter } from "../../model/filters"
import { dateKey } from "../../model/date"
import { resolveTimeFilter } from "../../model/time-filter"

export const QUICK_RANGES: {
  value: string
  label: string
  time: TimeFilter
}[] = [
  { value: "all", label: "全部", time: { kind: "all" } },
  { value: "year-to-date", label: "今年", time: { kind: "year-to-date" } },
  ...([12, 6, 3, 1] as const).map((months) => ({
    value: `months-${months}`,
    label: `近 ${months} 个月`,
    time: { kind: "rolling-months" as const, months },
  })),
]

export function quickRangeValue(time: TimeFilter) {
  if (time.kind === "rolling-months") return `months-${time.months}`
  return time.kind === "all" || time.kind === "year-to-date" ? time.kind : ""
}

export function describeTimeRange(time: TimeFilter, now: Date) {
  if (time.kind !== "rolling-months") return null
  const { start, end } = resolveTimeFilter(time, now)
  return start && end ? `${dateKey(start)} → ${dateKey(end)}` : null
}

export const TRANSACTION_TYPES = [
  "支出",
  "收入",
  "退款入账",
  "报销入账",
  "已报销",
  "待报销",
  "转账",
]
