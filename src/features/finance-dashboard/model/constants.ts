import type { Filters, RankLevel, RateMap } from "./types"

export const ALL_RANGE = "全部"
export const ALL_YEARS_OPTION = "全部年份"
export const BASE_CURRENCY = "CNY"
export const RANK_LEVELS = [
  "一级分类",
  "二级分类",
] as const satisfies readonly RankLevel[]

export const TRANSACTION_TYPES = [
  "支出",
  "收入",
  "退款入账",
  "报销入账",
  "已报销",
  "待报销",
  "转账",
]

export const QUICK_RANGES = [
  ALL_RANGE,
  "今年",
  "近 12 月",
  "近 6 月",
  "近 3 月",
  "近 1 月",
]

export const DEFAULT_RATES: RateMap = {
  [BASE_CURRENCY]: 1,
  HKD: 0.8688,
  USD: 6.8112,
  JPY: 0.0421,
  SGD: 5.2688,
  NZD: 3.8259,
  EUR: 7.7529,
  MOP: 0.8435,
}

export const EMPTY_FILTERS: Filters = {
  quickRange: ALL_RANGE,
  year: "",
  startDate: "",
  endDate: "",
  types: [],
  currencies: [],
  categories: [],
  tags: [],
  keyword: "",
}

export const CHART_COLORS = [
  "#E0A23B",
  "#34CE8A",
  "#5B9BD5",
  "#F26157",
  "#9B8AFB",
  "#3FC4C4",
  "#E0844F",
  "#C9CC4D",
  "#D46FA8",
  "#7D8794",
]

export const EXPENSE_COLOR = "#F26157"
export const INCOME_COLOR = "#34CE8A"
export const BALANCE_COLOR = "#E0A23B"
export const RANKING_COLOR = "#E0A23B"
export const RANKING_COLOR_END = "#F2BE62"
export const TAG_COLOR = "#E0A23B"
export const TAG_COLOR_ACTIVE = "#F2BE62"
export const WEEK_COLOR = "rgba(224, 162, 59, 0.22)"
export const WEEKEND_COLOR = "#E0A23B"
export const HEATMAP_COLORS = ["#f8fafc", "#F6E6BF", "#E0A23B", "#F26157"]

export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200]
