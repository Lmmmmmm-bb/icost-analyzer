import type { Filters, RateMap } from "./types"

export const ALL_RANGE = "全部"
export const BASE_CURRENCY = "CNY"

export const DEFAULT_RATES: RateMap = {
  [BASE_CURRENCY]: 1,
  USD: 6.8037,
  EUR: 7.7443,
  HKD: 0.8675,
  MOP: 0.8422,
  JPY: 0.042041,
  KRW: 0.004404,
  SGD: 5.2566,
  MYR: 1.6543,
  THB: 0.2042,
  TWD: 0.2133,
  AUD: 4.6896,
  NZD: 3.8337,
  GBP: 8.9755,
  CAD: 4.7942,
  CHF: 8.3958,
  PHP: 0.1109,
  INR: 0.072039,
  VND: 0.000258,
  IDR: 0.000379,
}

export const EMPTY_FILTERS: Filters = {
  quickRange: ALL_RANGE,
  year: "",
  startDate: "",
  endDate: "",
  types: [],
  currencies: [],
  categories: [],
  accounts: [],
  books: [],
  tags: [],
  excludedTags: [],
  keyword: "",
}
