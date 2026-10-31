import { useMemo, useReducer } from "react"

import { customTime, type ListFilterKey } from "../model/filters"
import { getMonthDateRange } from "../model/date"
import {
  type AccountSort,
  type DetailSort,
  type RankLevel,
  type SummarySort,
  type TagSort,
} from "../model/dashboard-controls"
import {
  createDashboardViewState,
  dashboardReducer,
  type FilterActions,
} from "../model/dashboard-state"

export function useDashboardViewState() {
  const [state, dispatch] = useReducer(dashboardReducer, undefined, () =>
    createDashboardViewState()
  )
  const actions = useMemo(() => {
    const setList = (key: ListFilterKey) => (values: string[]) =>
      dispatch({ type: "set-list-filter", key, values })
    const filters: FilterActions = {
      setTimeFilter: (time) => dispatch({ type: "set-time", time }),
      setKeyword: (keyword) => dispatch({ type: "set-keyword", keyword }),
      setTypes: setList("types"),
      setCurrencies: setList("currencies"),
      setCategories: setList("categories"),
      setAccounts: setList("accounts"),
      setBooks: setList("books"),
      setIncludedTags: setList("tags"),
      setExcludedTags: setList("excludedTags"),
      clearFilter: (key) => dispatch({ type: "clear-filter", key }),
      resetFilters: () => dispatch({ type: "reset-filters" }),
    }
    return {
      filters,
      applyWorkbook: () => dispatch({ type: "workbook-applied" }),
      applyMonth: (month: string) => {
        const { startDate, endDate } = getMonthDateRange(month)
        filters.setTimeFilter(customTime(startDate, endDate))
      },
      selectTag: (tag: string) => dispatch({ type: "focus-tag", tag }),
      selectCategory: (category: string) => filters.setCategories([category]),
      selectAccount: (account: string) => filters.setAccounts([account]),
      resetAccountFilter: () => filters.clearFilter("accounts"),
      drillCategory: (category: string) =>
        dispatch({ type: "drill-category", category }),
      changeRankLevel: (level: RankLevel) =>
        dispatch({ type: "rank-level", level }),
      sortCategories: (sort: SummarySort) =>
        dispatch({ type: "summary-sort", sort }),
      sortTags: (sort: TagSort) => dispatch({ type: "tag-sort", sort }),
      sortAccounts: (sort: AccountSort) =>
        dispatch({ type: "account-sort", sort }),
      sortDetails: (sort: DetailSort) =>
        dispatch({ type: "detail-sort", sort }),
      goToPage: (page: number) => dispatch({ type: "page", page }),
      changePageSize: (pageSize: number) =>
        dispatch({ type: "page-size", pageSize }),
    }
  }, [])
  return { state, actions }
}
