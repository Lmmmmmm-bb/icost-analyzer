import { Card, CardContent } from "@/components/ui/card"

import type { MetricStats, PeriodComparison } from "../../model/analytics-types"
import { formatMoney } from "../../model/money"
import { CollapsibleComparisonSection } from "./metrics-comparison/collapsible-comparison-section"

type HeroMetricsProps = {
  stats: MetricStats
  periodComparison: PeriodComparison
  yearComparison: PeriodComparison
}

type MetricItem = {
  label: string
  value: string
  caption?: string
}

export function HeroMetrics({
  stats,
  periodComparison,
  yearComparison,
}: HeroMetricsProps) {
  const primaryMetrics: MetricItem[] = [
    {
      label: "总支出",
      value: formatMoney(stats.totalExpense),
      caption: `${stats.expenseCount} 笔支出`,
    },
    {
      label: "总收入",
      value: formatMoney(stats.totalIncome),
      caption: "不包含转账",
    },
    {
      label: "净结余",
      value: formatMoney(stats.net),
      caption: "总收入 - 总支出",
    },
    {
      label: "交易笔数",
      value: `${stats.count} 笔`,
      caption: "当前筛选后的交易总数",
    },
  ]
  const secondaryMetrics: MetricItem[] = [
    { label: "月均支出", value: formatMoney(stats.monthlyExpense) },
    { label: "日均支出", value: formatMoney(stats.dailyExpense) },
    { label: "笔均支出", value: formatMoney(stats.avgExpense) },
    { label: "最大单笔", value: formatMoney(stats.maxExpense) },
    { label: "退款/报销", value: formatMoney(stats.reimburse) },
    { label: "涉及币种", value: `${stats.currencyCount} 种` },
    { label: "涉及标签", value: `${stats.tagCount} 个` },
  ]

  return (
    <Card className="relative gap-0 overflow-hidden bg-card/90 py-0 shadow-ledger-panel backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-foreground/35 via-transparent to-transparent" />
      <CardContent className="p-0">
        <div className="grid divide-y divide-border/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {primaryMetrics.map((metric) => (
            <div
              key={metric.label}
              className="group/metric relative flex flex-col gap-2 bg-background/35 p-4 transition-colors hover:bg-muted/35"
            >
              <div className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase transition-colors group-hover/metric:text-foreground">
                {metric.label}
              </div>
              <div className="font-heading text-2xl leading-tight font-semibold tracking-tight tabular-nums">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.caption}
              </div>
            </div>
          ))}
        </div>
        <div className="grid border-t border-border/70 bg-background/35 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {secondaryMetrics.map((metric) => (
            <div
              key={metric.label}
              className="group/metric flex min-h-14 flex-col justify-between gap-1.5 border-r border-b border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/35 xl:border-b-0 xl:last:border-r-0"
            >
              <div className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase transition-colors group-hover/metric:text-foreground">
                {metric.label}
              </div>
              <div className="font-heading text-base leading-none font-semibold tracking-tight tabular-nums">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
        <CollapsibleComparisonSection
          periodComparison={periodComparison}
          yearComparison={yearComparison}
        />
      </CardContent>
    </Card>
  )
}
