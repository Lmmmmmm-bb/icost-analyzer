import { ALL_RANGE } from "../../model/constants"
import { describeTimeRange } from "../../model/date"
import type { Filters } from "../../model/types"

export type ActiveFilterSummary = {
  label: string
  detail: string
  count: number
}

export function getActiveFilterSummaries(
  filters: Filters
): ActiveFilterSummary[] {
  const summaries: ActiveFilterSummary[] = []
  const keyword = filters.keyword.trim()

  if (filters.startDate || filters.endDate) {
    summaries.push({
      label: "日期",
      detail: formatDateRange(filters.startDate, filters.endDate),
      count: 1,
    })
  } else if (filters.year) {
    summaries.push({
      label: "年份",
      detail: filters.year,
      count: 1,
    })
  } else if (filters.quickRange !== ALL_RANGE) {
    summaries.push({
      label: "时间",
      detail: formatQuickRange(filters.quickRange),
      count: 1,
    })
  }

  if (keyword) {
    summaries.push({
      label: "关键词",
      detail: keyword,
      count: 1,
    })
  }

  appendListSummary(summaries, "类型", filters.types)
  appendListSummary(summaries, "币种", filters.currencies)
  appendListSummary(summaries, "账户", filters.accounts)
  appendListSummary(summaries, "分类", filters.categories)
  appendListSummary(summaries, "包含标签", filters.tags)
  appendListSummary(summaries, "排除标签", filters.excludedTags)

  return summaries
}

function appendListSummary(
  summaries: ActiveFilterSummary[],
  label: string,
  values: string[]
) {
  if (!values.length) return
  summaries.push({
    label,
    detail: values.join("、"),
    count: values.length,
  })
}

function formatDateRange(startDate: string, endDate: string) {
  if (startDate && endDate) return `${startDate} 至 ${endDate}`
  if (startDate) return `自 ${startDate} 起`
  return `截至 ${endDate}`
}

function formatQuickRange(range: string) {
  const detail = describeTimeRange(range)

  return detail ? `${range}（${detail}）` : range
}
