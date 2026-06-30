import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { RiArrowDownSLine } from "@remixicon/react"

import type {
  MetricStats,
  PeriodComparison,
  PeriodTopMover,
  PeriodTrend,
} from "../../model/analytics-types"
import { formatMoney } from "../../model/money"

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

type TrendTone = "expense" | "income" | "net"
type TrendMetricConfig = {
  label: string
  trend: PeriodTrend
  tone: TrendTone
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
    { label: "涉及货币", value: `${stats.currencyCount} 种` },
    { label: "涉及标签", value: `${stats.tagCount} 个` },
  ]
  const periodTrendMetrics = createTrendMetrics(periodComparison, "环比")
  const yearTrendMetrics = createTrendMetrics(yearComparison, "同比")

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
          periodTrendMetrics={periodTrendMetrics}
          yearComparison={yearComparison}
          yearTrendMetrics={yearTrendMetrics}
        />
      </CardContent>
    </Card>
  )
}

function CollapsibleComparisonSection({
  periodComparison,
  periodTrendMetrics,
  yearComparison,
  yearTrendMetrics,
}: {
  periodComparison: PeriodComparison
  periodTrendMetrics: TrendMetricConfig[]
  yearComparison: PeriodComparison
  yearTrendMetrics: TrendMetricConfig[]
}) {
  const visibleComparisonCount = [
    periodComparison.canCompare,
    yearComparison.canCompare,
  ].filter(Boolean).length

  if (!visibleComparisonCount) return null

  return (
    <Collapsible className="border-t border-border/70 bg-background/35">
      <CollapsibleTrigger className="group/comparison-trigger flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none">
        <div className="grid gap-1">
          <div className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            环比 / 同比
          </div>
          <div className="text-sm font-medium text-foreground">
            展开查看 {visibleComparisonCount} 组趋势对比
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden group-data-[panel-open]/comparison-trigger:inline">
            收起
          </span>
          <span className="group-data-[panel-open]/comparison-trigger:hidden">
            展开
          </span>
          <RiArrowDownSLine
            data-icon="inline-end"
            className="transition-transform group-data-[panel-open]/comparison-trigger:rotate-180"
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden border-t border-border/70 data-open:ledger-collapsible-down data-closed:ledger-collapsible-up">
        <ComparisonSection
          comparison={periodComparison}
          marker="Δ"
          metrics={periodTrendMetrics}
          categoryTitle="分类支出环比 Top"
          tagTitle="标签支出环比 Top"
          currentPeriodText="本周期"
          previousPeriodText="上周期"
          emptyCategoryText="还没有可对比的分类支出"
          emptyTagText="还没有可对比的标签支出"
        />
        <ComparisonSection
          comparison={yearComparison}
          marker="Y/Y"
          metrics={yearTrendMetrics}
          categoryTitle="分类支出同比 Top"
          tagTitle="标签支出同比 Top"
          currentPeriodText="本周期"
          previousPeriodText="去年同期"
          emptyCategoryText="还没有可同比的分类支出"
          emptyTagText="还没有可同比的标签支出"
        />
      </CollapsibleContent>
    </Collapsible>
  )
}

function createTrendMetrics(
  comparison: PeriodComparison,
  suffix: "环比" | "同比"
): TrendMetricConfig[] {
  return [
    { label: `总支出${suffix}`, trend: comparison.expense, tone: "expense" },
    { label: `收入${suffix}`, trend: comparison.income, tone: "income" },
    { label: `净结余${suffix}`, trend: comparison.net, tone: "net" },
  ]
}

function ComparisonSection({
  comparison,
  marker,
  metrics,
  categoryTitle,
  tagTitle,
  currentPeriodText,
  previousPeriodText,
  emptyCategoryText,
  emptyTagText,
}: {
  comparison: PeriodComparison
  marker: string
  metrics: TrendMetricConfig[]
  categoryTitle: string
  tagTitle: string
  currentPeriodText: string
  previousPeriodText: string
  emptyCategoryText: string
  emptyTagText: string
}) {
  if (!comparison.canCompare) return null

  return (
    <div className="grid bg-background/35 lg:grid-cols-[1.05fr_1.4fr] [&+&]:border-t [&+&]:border-border/70">
      <div className="grid border-b border-border/70 sm:grid-cols-3 lg:border-r lg:border-b-0">
        {metrics.map((metric) => (
          <TrendMetric
            key={metric.label}
            label={metric.label}
            trend={metric.trend}
            tone={metric.tone}
            marker={marker}
            currentPeriodText={currentPeriodText}
            previousPeriodText={previousPeriodText}
            currentLabel={comparison.currentLabel}
            previousLabel={comparison.previousLabel}
          />
        ))}
      </div>
      <div className="grid md:grid-cols-2">
        <TopMoverList
          title={categoryTitle}
          items={comparison.categoryExpenseTop}
          emptyText={emptyCategoryText}
        />
        <TopMoverList
          title={tagTitle}
          items={comparison.tagExpenseTop}
          emptyText={emptyTagText}
          className="border-t border-border/70 md:border-t-0 md:border-l"
        />
      </div>
    </div>
  )
}

function TrendMetric({
  label,
  trend,
  tone,
  marker,
  currentPeriodText,
  previousPeriodText,
  currentLabel,
  previousLabel,
}: {
  label: string
  trend: PeriodTrend
  tone: TrendTone
  marker: string
  currentPeriodText: string
  previousPeriodText: string
  currentLabel: string
  previousLabel: string
}) {
  const isGood = tone === "expense" ? trend.change <= 0 : trend.change >= 0
  const colorClass = isGood ? "text-positive" : "text-destructive"
  return (
    <div className="group/trend relative min-h-36 overflow-hidden border-r border-b border-border/70 p-4 transition-colors hover:bg-muted/35 sm:border-b-0 sm:last:border-r-0 lg:last:border-r lg:[&:nth-child(3)]:border-r-0">
      <div
        aria-hidden="true"
        className={cn(
          "absolute right-3 bottom-3 font-mono text-5xl leading-none font-semibold tracking-[-0.12em] opacity-[0.06] transition-opacity select-none group-hover/trend:opacity-10",
          colorClass
        )}
      >
        {marker}
      </div>
      <div className="relative grid gap-2">
        <div className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase transition-colors group-hover/trend:text-foreground">
          {label}
        </div>
        <div
          className={cn(
            "font-heading text-2xl leading-none font-semibold tracking-tight tabular-nums",
            colorClass
          )}
        >
          {formatPercent(trend.changeRate)}
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">
          {formatSignedMoney(trend.change)}
        </div>
        <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground tabular-nums">
          <PeriodValue
            label={currentPeriodText}
            value={trend.current}
            detail={currentLabel}
          />
          <PeriodValue
            label={previousPeriodText}
            value={trend.previous}
            detail={previousLabel}
          />
        </div>
      </div>
    </div>
  )
}

function PeriodValue({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail: string
}) {
  const trigger = (
    <span
      tabIndex={0}
      className="inline-flex w-fit cursor-help items-baseline gap-1 border-b border-dotted border-muted-foreground/40 outline-none transition-colors hover:border-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:text-foreground"
    >
      <span>{label}</span>
      <span>{formatMoney(value)}</span>
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent className="font-mono tracking-[0.04em]">
        {detail || label}
      </TooltipContent>
    </Tooltip>
  )
}

function TopMoverList({
  title,
  items,
  emptyText,
  className,
}: {
  title: string
  items: PeriodTopMover[]
  emptyText: string
  className?: string
}) {
  return (
    <div className={cn("p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
          {title}
        </div>
        <div className="h-px flex-1 bg-border/70" />
      </div>
      {items.length ? (
        <div className="grid gap-2.5">
          {items.map((item) => {
            const width = getMoverBarWidth(item, items)
            return (
              <div key={item.name} className="group/mover grid gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs tabular-nums",
                      item.change >= 0 ? "text-destructive" : "text-positive"
                    )}
                  >
                    {formatSignedMoney(item.change, true)} ·{" "}
                    {formatPercent(item.changeRate)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden bg-muted">
                  <div
                    className={cn(
                      "h-full transition-[width] duration-500 group-hover/mover:opacity-80",
                      item.change >= 0 ? "bg-destructive" : "bg-positive"
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  )
}

function formatPercent(value: number | null) {
  if (value === null) return "—"
  const formatted = Math.abs(value).toLocaleString("zh-CN", {
    maximumFractionDigits: 1,
    style: "percent",
  })
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

function formatSignedMoney(value: number, compact = false) {
  if (value > 0) return `+${formatMoney(value, compact)}`
  if (value < 0) return `-${formatMoney(Math.abs(value), compact)}`
  return formatMoney(0, compact)
}

function getMoverBarWidth(item: PeriodTopMover, items: PeriodTopMover[]) {
  const maxChange = Math.max(
    ...items.map((candidate) => Math.abs(candidate.change))
  )
  if (maxChange === 0) return 8
  return Math.max(8, (Math.abs(item.change) / maxChange) * 100)
}
