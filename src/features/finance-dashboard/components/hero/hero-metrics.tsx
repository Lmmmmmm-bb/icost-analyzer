import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import type { MetricStats, PeriodComparison } from "../../model/analytics-types"
import { formatMoney } from "../../model/money"
import { LedgerCornerGrid, LedgerEdgeNotch } from "../shared/ledger-accents"
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
  marker?: string
  tooltipRows?: {
    label: string
    value: string
  }[]
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
      marker: "OUT",
    },
    {
      label: "总收入",
      value: formatMoney(stats.totalIncome),
      caption: "不包含转账",
      marker: "IN",
      tooltipRows: [
        { label: "收入", value: formatMoney(stats.incomeBreakdown.income) },
        { label: "退款", value: formatMoney(stats.incomeBreakdown.refund) },
        { label: "报销", value: formatMoney(stats.incomeBreakdown.reimburse) },
      ],
    },
    {
      label: "净结余",
      value: formatMoney(stats.net),
      caption: "总收入 - 总支出",
      marker: "NET",
    },
    {
      label: "交易笔数",
      value: `${stats.count} 笔`,
      caption: "当前筛选后的交易总数",
      marker: "TX",
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
      <LedgerEdgeNotch className="right-0 bottom-0 opacity-45 group-hover/card:opacity-70" />
      <CardContent className="p-0">
        <div className="grid divide-y divide-border/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {primaryMetrics.map((metric) => {
            const card = (
              <div
                key={metric.label}
                tabIndex={metric.tooltipRows ? 0 : undefined}
                className={cn(
                  "group/metric relative flex flex-col gap-2 bg-background/35 p-4 transition-colors hover:bg-muted/35",
                  metric.tooltipRows && "cursor-help"
                )}
              >
                <LedgerCornerGrid className="top-3 right-3 opacity-0 group-hover/metric:opacity-45" />
                {metric.marker ? (
                  <div
                    aria-hidden="true"
                    className="absolute right-3 bottom-3 font-mono text-5xl leading-none font-semibold tracking-[-0.12em] text-foreground opacity-[0.045] transition-opacity select-none group-hover/metric:opacity-[0.075]"
                  >
                    {metric.marker}
                  </div>
                ) : null}
                <div className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase transition-colors group-hover/metric:text-foreground">
                  {metric.label}
                </div>
                <div
                  className={cn(
                    "w-fit border-b border-transparent font-heading text-2xl leading-tight font-semibold tracking-tight tabular-nums transition-colors",
                    metric.tooltipRows &&
                      "border-dotted border-muted-foreground/40 group-hover/metric:border-foreground/60 group-focus-visible/metric:border-ring"
                  )}
                >
                  {metric.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.caption}
                </div>
              </div>
            )

            if (!metric.tooltipRows) return card

            return (
              <Tooltip key={metric.label}>
                <TooltipTrigger render={card} />
                <TooltipContent
                  side="top"
                  className="flex min-w-36 flex-col items-stretch gap-1.5 text-left"
                >
                  {metric.tooltipRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-4">
                      <span className="text-background/70">{row.label}</span>
                      <span className="ml-auto font-mono tabular-nums">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </TooltipContent>
              </Tooltip>
            )
          })}
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
