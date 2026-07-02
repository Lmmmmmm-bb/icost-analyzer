export type RankLevel = "一级分类" | "二级分类"

export const RANK_LEVELS = [
  "一级分类",
  "二级分类",
] as const satisfies readonly RankLevel[]

export type SummarySort = "amount" | "count" | "avg"
export type TagSort = "amount" | "count" | "days"
export type AccountSort = "amount" | "count"
export type DetailSort = "date" | "dateAsc" | "amount"
