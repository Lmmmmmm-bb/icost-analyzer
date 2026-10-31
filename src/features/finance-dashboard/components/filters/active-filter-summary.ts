import {
  describeTimeRange,
  QUICK_RANGES,
  quickRangeValue,
} from "./filter-options"
import type { FilterKey, ListFilterKey } from "../../model/filters"
import type { Filters } from "../../model/types"

export type ActiveFilterSummary = {
  key: FilterKey
  label: string
  detail: string
  tooltip?: string
  count: number
}

export function getActiveFilterSummaries(
  filters: Filters,
  now: Date
): ActiveFilterSummary[] {
  const summaries: ActiveFilterSummary[] = []
  const keyword = filters.keyword.trim()

  const time = filters.time
  if (time.kind !== "all") {
    summaries.push({
      key: "time",
      label:
        time.kind === "custom"
          ? "日期"
          : time.kind === "year"
            ? "年份"
            : "时间",
      detail:
        time.kind === "custom"
          ? formatDateRange(time.from ?? "", time.to ?? "")
          : time.kind === "year"
            ? String(time.year)
            : QUICK_RANGES.find(
                (option) => option.value === quickRangeValue(time)
              )!.label,
      tooltip: describeTimeRange(time, now) ?? undefined,
      count: 1,
    })
  }

  if (keyword) {
    summaries.push({
      key: "keyword",
      label: "关键词",
      detail: keyword,
      count: 1,
    })
  }

  appendListSummary(summaries, "types", "类型", filters.types)
  appendListSummary(summaries, "currencies", "币种", filters.currencies)
  appendListSummary(summaries, "books", "账本", filters.books)
  appendListSummary(summaries, "accounts", "账户", filters.accounts)
  appendListSummary(summaries, "categories", "分类", filters.categories)
  appendListSummary(summaries, "tags", "包含标签", filters.tags)
  appendListSummary(summaries, "excludedTags", "排除标签", filters.excludedTags)

  return summaries
}

function appendListSummary(
  summaries: ActiveFilterSummary[],
  key: ListFilterKey,
  label: string,
  values: string[]
) {
  if (!values.length) return
  summaries.push({
    key,
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
