import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { RiArrowDownSLine } from "@remixicon/react"

import type { PeriodComparison } from "../../../model/analytics-types"
import { createTrendMetrics } from "./comparison-metrics"
import { ComparisonSection } from "./comparison-section"

type CollapsibleComparisonSectionProps = {
  periodComparison: PeriodComparison
  yearComparison: PeriodComparison
}

export function CollapsibleComparisonSection({
  periodComparison,
  yearComparison,
}: CollapsibleComparisonSectionProps) {
  const visibleComparisonCount = [
    periodComparison.canCompare,
    yearComparison.canCompare,
  ].filter(Boolean).length
  const canExpandComparison = visibleComparisonCount > 0

  return (
    <Collapsible className="border-t border-border/70 bg-background/35">
      <CollapsibleTrigger
        disabled={!canExpandComparison}
        className="group/comparison-trigger flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
      >
        <div className="grid gap-1">
          <div className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            环比 / 同比
          </div>
          <div className="text-sm font-medium text-foreground">
            {canExpandComparison
              ? `展开查看 ${visibleComparisonCount} 组趋势对比`
              : "暂无可展开的趋势对比"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          {canExpandComparison ? (
            <>
              <span className="hidden group-data-[panel-open]/comparison-trigger:inline">
                收起
              </span>
              <span className="group-data-[panel-open]/comparison-trigger:hidden">
                展开
              </span>
            </>
          ) : (
            <span>不可用</span>
          )}
          <RiArrowDownSLine
            data-icon="inline-end"
            className={cn(
              "transition-transform group-data-[panel-open]/comparison-trigger:rotate-180",
              !canExpandComparison && "opacity-45"
            )}
          />
        </div>
      </CollapsibleTrigger>
      {canExpandComparison ? (
        <CollapsibleContent className="data-open:ledger-collapsible-down data-closed:ledger-collapsible-up overflow-hidden border-t border-border/70">
          <ComparisonSection
            comparison={periodComparison}
            marker="Δ"
            metrics={createTrendMetrics(periodComparison, "环比")}
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
            metrics={createTrendMetrics(yearComparison, "同比")}
            categoryTitle="分类支出同比 Top"
            tagTitle="标签支出同比 Top"
            currentPeriodText="本周期"
            previousPeriodText="去年同期"
            emptyCategoryText="还没有可同比的分类支出"
            emptyTagText="还没有可同比的标签支出"
          />
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  )
}
