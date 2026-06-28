import type { Filters, RateMap } from "./types"

export const ALL_RANGE = "全部"
export const BASE_CURRENCY = "CNY"

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
