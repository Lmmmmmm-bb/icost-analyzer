import { useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import type {
  MonthlyBillItem,
  MonthlyItem,
  MonthlyLargestExpense,
} from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"

type MonthlyReviewDialogProps = {
  monthlyReview: MonthlyItem[]
}

export function MonthlyReviewDialog({
  monthlyReview,
}: MonthlyReviewDialogProps) {
  const [selectedReviewMonth, setSelectedReviewMonth] = useState("")
  const reviewContentRef = useRef<HTMLDivElement>(null)
  const monthlyReviewCards = useMemo(
    () => [...monthlyReview].sort((a, b) => b.month.localeCompare(a.month)),
    [monthlyReview]
  )
  const selectedReview = selectedReviewMonth
    ? monthlyReviewCards.find((month) => month.month === selectedReviewMonth)
    : undefined

  useEffect(() => {
    reviewContentRef.current?.scrollTo({ top: 0 })
  }, [selectedReviewMonth])

  return (
    <DialogContent className="flex max-h-[min(48rem,calc(100svh-1rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border/70 bg-[radial-gradient(circle_at_18%_16%,color-mix(in_oklch,var(--primary),transparent_94%),transparent_38%),linear-gradient(135deg,color-mix(in_oklch,var(--muted),transparent_76%),transparent_64%)] p-5 pr-12">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="w-fit font-mono">
                MONTHLY REVIEW
              </Badge>
              {selectedReview ? (
                <Badge variant="secondary" className="font-mono">
                  {selectedReview.month}
                </Badge>
              ) : null}
            </div>
            <DialogTitle className="font-heading text-2xl leading-tight font-semibold tracking-[-0.04em]">
              {selectedReview ? "当月交易明细" : "月度复盘"}
            </DialogTitle>
            <DialogDescription>
              {selectedReview
                ? "查看本月全部交易，核对日期、类型、分类、备注、标签、币种与金额。"
                : "按月回顾收入、支出、结余、储蓄率和最大支出。"}
            </DialogDescription>
          </div>
          <div
            aria-hidden="true"
            className="hidden rotate-[-7deg] border border-primary/25 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-primary/70 uppercase opacity-60 sm:block"
          >
            reconciled
          </div>
        </div>
      </DialogHeader>

      <div
        ref={reviewContentRef}
        className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5"
      >
        {selectedReview ? (
          <MonthlyBillsDetail
            month={selectedReview}
            onBack={() => setSelectedReviewMonth("")}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {monthlyReviewCards.map((month) => (
              <MonthlyReviewCard
                key={month.month}
                month={month}
                onSelect={() => setSelectedReviewMonth(month.month)}
              />
            ))}
          </div>
        )}
      </div>
    </DialogContent>
  )
}

function MonthlyReviewCard({
  month,
  onSelect,
}: {
  month: MonthlyItem
  onSelect: () => void
}) {
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

function MonthlyBillsDetail({
  month,
  onBack,
}: {
  month: MonthlyItem
  onBack: () => void
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 border border-border/80 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            共 {month.bills.length} 笔交易
          </h3>
          <p className="text-xs text-muted-foreground">
            收入 {formatMoney(month.income)} · 支出 {formatMoney(month.expense)}{" "}
            · 结余 {formatMoney(month.net)}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          返回月度复盘
        </Button>
      </div>

      <div className="overflow-hidden border border-border/80 bg-card/90">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>备注 / 地点</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>币种</TableHead>
              <TableHead>原币金额</TableHead>
              <TableHead>人民币折算</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {month.bills.map((bill) => (
              <MonthlyBillRow key={bill.id} bill={bill} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function MonthlyBillRow({ bill }: { bill: MonthlyBillItem }) {
  return (
    <TableRow className="group/review-bill">
      <TableCell className="font-mono text-[11px] text-muted-foreground transition-colors group-hover/review-bill:text-foreground">
        {bill.dateText}
      </TableCell>
      <TableCell>
        <Badge variant={getBillBadgeVariant(bill)}>{bill.type}</Badge>
      </TableCell>
      <TableCell>
        {bill.category}
        {bill.subcategory ? ` / ${bill.subcategory}` : ""}
      </TableCell>
      <TableCell
        className="max-w-80 truncate"
        title={`${bill.note} ${bill.location}`}
      >
        {bill.note || "无备注"}
        {bill.location ? ` · ${bill.location}` : ""}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {bill.tags.length ? (
            bill.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono text-[11px]">{bill.currency}</TableCell>
      <TableCell className="font-mono text-[11px] tabular-nums">
        {bill.amount.toLocaleString("zh-CN", {
          maximumFractionDigits: 3,
        })}{" "}
        {bill.currency}
      </TableCell>
      <TableCell className="font-mono text-[11px] font-medium tabular-nums">
        {formatMoney(bill.rmb)}
      </TableCell>
    </TableRow>
  )
}

function getBillBadgeVariant(bill: MonthlyBillItem) {
  if (bill.direction === "expense") return "destructive"
  if (bill.direction === "income") return "positive"
  return "secondary"
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
