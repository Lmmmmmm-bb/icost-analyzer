import type {
  DailySummary,
  HeatmapEntry,
  MonthlySummary,
  SummaryItem,
  WeekItem,
} from "../model/analytics-types"

export type DashboardChartData = {
  monthly: MonthlySummary[]
  categoryPie: SummaryItem[]
  ranking: SummaryItem[]
  accountSummary: SummaryItem[]
  currencySummary: SummaryItem[]
  weekSummary: WeekItem[]
  tagSummary: SummaryItem[]
  heatmap: HeatmapEntry[]
  dailyCashflow: DailySummary[]
}
