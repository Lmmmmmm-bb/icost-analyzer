import { createEmptyFilters, customTime, type Filters } from "../model/filters"
import type { QueryWhere } from "./query-schema"

/** Public tool DTO: intentionally independent of the internal time union. */
export type QueryFilters = Omit<Filters, "time"> & {
  quickRange: string
  year: string
  startDate: string
  endDate: string
}

export function toQueryFilters({ time, ...filters }: Filters): QueryFilters {
  return {
    ...filters,
    quickRange:
      time.kind === "year-to-date"
        ? "今年"
        : time.kind === "rolling-months"
          ? `近 ${time.months} 个月`
          : "全部",
    year: time.kind === "year" ? String(time.year) : "",
    startDate: time.kind === "custom" ? (time.from ?? "") : "",
    endDate: time.kind === "custom" ? (time.to ?? "") : "",
  }
}

export function filterFromWhere(where: QueryWhere): Filters {
  return {
    ...createEmptyFilters(),
    time: customTime(where.from ?? null, where.to ?? null),
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

export function nonDateFilters(filters: Filters): Filters {
  return { ...filters, time: { kind: "all" } }
}
