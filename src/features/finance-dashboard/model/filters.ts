export type TimeFilter =
  | { kind: "all" }
  | { kind: "year-to-date" }
  | { kind: "rolling-months"; months: 1 | 3 | 6 | 12 }
  | { kind: "year"; year: number }
  | { kind: "custom"; from: string | null; to: string | null }

export type Filters = {
  time: TimeFilter
  types: string[]
  currencies: string[]
  categories: string[]
  accounts: string[]
  books: string[]
  tags: string[]
  excludedTags: string[]
  keyword: string
}

export type FilterKey = keyof Filters
export type ListFilterKey = Exclude<FilterKey, "time" | "keyword">

export function createEmptyFilters(): Filters {
  return {
    time: { kind: "all" },
    types: [],
    currencies: [],
    categories: [],
    accounts: [],
    books: [],
    tags: [],
    excludedTags: [],
    keyword: "",
  }
}

export function clearFilterGroup(filters: Filters, key: FilterKey): Filters {
  if (key === "time") return { ...filters, time: { kind: "all" } }
  if (key === "keyword") return { ...filters, keyword: "" }
  return { ...filters, [key]: [] }
}

export function customTime(from: string | null, to: string | null): TimeFilter {
  return from || to
    ? { kind: "custom", from: from || null, to: to || null }
    : { kind: "all" }
}
