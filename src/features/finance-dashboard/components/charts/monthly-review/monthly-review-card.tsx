import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type {
  MonthlyItem,
  MonthlyLargestExpense,
} from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"

type MonthlyReviewCardProps = {
  month: MonthlyItem
  onSelect: () => void
}

export function MonthlyReviewCard({ month, onSelect }: MonthlyReviewCardProps) {
  return (
    <article className="group/review relative overflow-hidden border border-border/80 bg-card/92 transition-colors hover:bg-card">
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 border-b border-l border-border/45 bg-background/45 px-2 py-1 font-mono text-base leading-none font-semibold tracking-[-0.06em] text-muted-foreground/20 select-none"
      >
        {month.month}
      </div>
      <div className="relative border-b border-border/70 p-3">
        <div className="relative z-10 grid gap-1">
          <div className="grid gap-1">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              复盘月份
            </p>
            <div className="flex items-end justify-between gap-3">
              <h3 className="font-heading text-lg leading-tight font-semibold tracking-tight">
                {month.month}
              </h3>
              <Badge
                className="w-fit shrink-0"
                variant={month.net >= 0 ? "positive" : "destructive"}
              >
                {month.net >= 0 ? "结余" : "透支"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-2 border-b border-border/70">
        <ReviewMetric
          label="本月收入"
          value={formatMoney(month.income)}
          tone="positive"
        />
        <ReviewMetric
          label="本月支出"
          value={formatMoney(month.expense)}
          tone="destructive"
        />
        <ReviewMetric
          label="本月结余"
          value={formatMoney(month.net)}
          tone={month.net >= 0 ? "positive" : "destructive"}
        />
        <ReviewMetric
          label="储蓄率"
          value={formatSavingsRate(month.savingsRate)}
          tone={
            month.savingsRate !== null && month.savingsRate >= 0
              ? "positive"
              : "destructive"
          }
        />
      </div>

      <div className="relative grid gap-3 p-3">
        <ReviewFact
          label="最大支出分类"
          value={month.topExpenseCategory.name}
          detail={formatMoney(month.topExpenseCategory.amount)}
        />
        <ReviewFact
          label="最大单笔"
          value={
            month.largestExpense
              ? getLargestExpenseTitle(month.largestExpense)
              : "暂无支出"
          }
          detail={
            month.largestExpense
              ? `${month.largestExpense.day} · ${formatMoney(
                  month.largestExpense.rmb
                )}`
              : "本月没有可复盘的支出记录"
          }
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 w-full"
          onClick={onSelect}
        >
          查看当月明细
        </Button>
      </div>
    </article>
  )
}

type ReviewTone = "positive" | "destructive"

function ReviewMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: ReviewTone
}) {
  return (
    <div className="border-r border-b border-border/70 p-3 last:border-b-0 odd:border-r even:border-r-0 [&:nth-last-child(2)]:border-b-0">
      <p className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-heading text-sm leading-tight font-semibold tabular-nums",
          tone === "positive" ? "text-positive" : "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ReviewFact({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="grid gap-0.5 border-l border-primary/40 pl-2.5">
      <p className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium" title={value}>
        {value}
      </p>
      <p className="truncate text-xs text-muted-foreground" title={detail}>
        {detail}
      </p>
    </div>
  )
}

function formatSavingsRate(value: number | null) {
  if (value === null) return "—"
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: 1,
    style: "percent",
  })
}

function getLargestExpenseTitle(expense: MonthlyLargestExpense) {
  const category = expense.subcategory
    ? `${expense.category} / ${expense.subcategory}`
    : expense.category
  return expense.note ? `${category} · ${expense.note}` : category
}
