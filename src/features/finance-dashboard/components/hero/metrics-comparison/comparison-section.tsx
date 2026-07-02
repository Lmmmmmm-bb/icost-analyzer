import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import type {
  PeriodComparison,
  PeriodTopMover,
  PeriodTrend,
} from "../../../model/analytics-types"
import { formatMoney, formatSignedMoney } from "../../../model/money"
import type { TrendMetricConfig, TrendTone } from "./comparison-metrics"

type ComparisonSectionProps = {
  comparison: PeriodComparison
  marker: string
  metrics: TrendMetricConfig[]
  categoryTitle: string
  tagTitle: string
  currentPeriodText: string
  previousPeriodText: string
  emptyCategoryText: string
  emptyTagText: string
}

export function ComparisonSection({
  comparison,
  marker,
  metrics,
  categoryTitle,
  tagTitle,
  currentPeriodText,
  previousPeriodText,
  emptyCategoryText,
  emptyTagText,
}: ComparisonSectionProps) {
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
      className="inline-flex w-fit cursor-help items-baseline gap-1 border-b border-dotted border-muted-foreground/40 transition-colors outline-none hover:border-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:text-foreground"
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

function getMoverBarWidth(item: PeriodTopMover, items: PeriodTopMover[]) {
  const maxChange = Math.max(
    ...items.map((candidate) => Math.abs(candidate.change))
  )
  if (maxChange === 0) return 8
  return Math.max(8, (Math.abs(item.change) / maxChange) * 100)
}
