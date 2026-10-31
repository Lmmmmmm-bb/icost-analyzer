import {
  type AccountSort,
  type DetailSort,
  type RankLevel,
  RANK_LEVELS,
  type SummarySort,
  type TagSort,
} from "./dashboard-controls"
import {
  clearFilterGroup,
  createEmptyFilters,
  type FilterKey,
  type Filters,
  type ListFilterKey,
  type TimeFilter,
} from "./filters"

export type DashboardViewState = {
  filters: Filters
  drillCategory: string
  rankLevel: RankLevel
  summarySort: SummarySort
  tagSort: TagSort
  accountSort: AccountSort
  detailSort: DetailSort
  page: number
  pageSize: number
}

export type FilterActions = {
  setTimeFilter: (time: TimeFilter) => void
  setKeyword: (keyword: string) => void
  setTypes: (values: string[]) => void
  setCurrencies: (values: string[]) => void
  setCategories: (values: string[]) => void
  setAccounts: (values: string[]) => void
  setBooks: (values: string[]) => void
  setIncludedTags: (values: string[]) => void
  setExcludedTags: (values: string[]) => void
  clearFilter: (key: FilterKey) => void
  resetFilters: () => void
}

export type DashboardAction =
  | { type: "set-time"; time: TimeFilter }
  | { type: "set-keyword"; keyword: string }
  | { type: "set-list-filter"; key: ListFilterKey; values: string[] }
  | { type: "clear-filter"; key: FilterKey }
  | { type: "reset-filters" }
  | { type: "focus-tag"; tag: string }
  | { type: "drill-category"; category: string }
  | { type: "rank-level"; level: RankLevel }
  | { type: "summary-sort"; sort: SummarySort }
  | { type: "tag-sort"; sort: TagSort }
  | { type: "account-sort"; sort: AccountSort }
  | { type: "detail-sort"; sort: DetailSort }
  | { type: "page"; page: number }
  | { type: "page-size"; pageSize: number }
  | { type: "workbook-applied" }

export function createDashboardViewState(pageSize = 25): DashboardViewState {
  return {
    filters: createEmptyFilters(),
    drillCategory: "",
    rankLevel: RANK_LEVELS[0],
    summarySort: "amount",
    tagSort: "amount",
    accountSort: "amount",
    detailSort: "date",
    page: 1,
    pageSize,
  }
}

function applyFilters(
  state: DashboardViewState,
  filters: Filters
): DashboardViewState {
  return { ...state, filters, drillCategory: "", page: 1 }
}

export function dashboardReducer(
  state: DashboardViewState,
  action: DashboardAction
): DashboardViewState {
  switch (action.type) {
    case "set-time":
      return applyFilters(state, { ...state.filters, time: action.time })
    case "set-keyword":
      return applyFilters(state, { ...state.filters, keyword: action.keyword })
    case "set-list-filter": {
      const filters = { ...state.filters, [action.key]: [...action.values] }
      if (action.key === "tags")
        filters.excludedTags = filters.excludedTags.filter(
          (tag) => !action.values.includes(tag)
        )
      if (action.key === "excludedTags")
        filters.tags = filters.tags.filter(
          (tag) => !action.values.includes(tag)
        )
      return applyFilters(state, filters)
    }
    case "clear-filter":
      return applyFilters(state, clearFilterGroup(state.filters, action.key))
    case "reset-filters":
      return applyFilters(state, createEmptyFilters())
    case "focus-tag":
      return applyFilters(state, {
        ...state.filters,
        tags: [action.tag],
        excludedTags: [],
      })
    case "drill-category":
      return { ...state, drillCategory: action.category }
    case "rank-level":
      return { ...state, rankLevel: action.level }
    case "summary-sort":
      return { ...state, summarySort: action.sort }
    case "tag-sort":
      return { ...state, tagSort: action.sort }
    case "account-sort":
      return { ...state, accountSort: action.sort }
    case "detail-sort":
      return { ...state, detailSort: action.sort, page: 1 }
    case "page":
      return Number.isFinite(action.page)
        ? { ...state, page: Math.max(1, Math.trunc(action.page)) }
        : state
    case "page-size":
      return [25, 50, 100, 200].includes(action.pageSize)
        ? { ...state, pageSize: action.pageSize, page: 1 }
        : state
    case "workbook-applied":
      return createDashboardViewState(state.pageSize)
  }
}
