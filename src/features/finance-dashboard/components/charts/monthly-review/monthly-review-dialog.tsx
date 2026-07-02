import { useEffect, useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { MonthlyItem } from "../../../model/analytics-types"
import { MonthlyBillsDetail } from "./monthly-bills-detail"
import { MonthlyReviewCard } from "./monthly-review-card"

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
