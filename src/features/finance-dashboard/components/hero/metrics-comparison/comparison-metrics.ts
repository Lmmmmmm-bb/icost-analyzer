import type {
  PeriodComparison,
  PeriodTrend,
} from "../../../model/analytics-types"

export type TrendTone = "expense" | "income" | "net"

export type TrendMetricConfig = {
  label: string
  trend: PeriodTrend
  tone: TrendTone
}

export function createTrendMetrics(
  comparison: PeriodComparison,
  suffix: "环比" | "同比"
): TrendMetricConfig[] {
  return [
    { label: `总支出${suffix}`, trend: comparison.expense, tone: "expense" },
    { label: `收入${suffix}`, trend: comparison.income, tone: "income" },
    { label: `净结余${suffix}`, trend: comparison.net, tone: "net" },
  ]
}
