import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type {
  DailyBillItem,
  DailyCashflowItem,
} from "../../../model/analytics-types"
import { formatMoney } from "../../../model/money"

type DailyCashflowDetailProps = {
  selectedCashflow?: DailyCashflowItem
}

export function DailyCashflowDetail({
  selectedCashflow,
}: DailyCashflowDetailProps) {
  return (
    <div className="flex min-h-0 flex-col xl:absolute xl:inset-y-0 xl:right-0 xl:left-[30rem]">
      <div className="flex shrink-0 items-center justify-between gap-3 bg-transparent p-4">
        <div className="grid gap-1">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            {selectedCashflow?.day ?? "选择日期查看交易"}
          </h3>
          {!selectedCashflow ? (
            <p className="text-sm text-muted-foreground">
              点击有记录的日期查看当天交易。
            </p>
          ) : null}
        </div>
        {selectedCashflow ? (
          <Badge variant="outline">共 {selectedCashflow.count} 笔记录</Badge>
        ) : null}
      </div>

      {selectedCashflow ? (
        <>
          <DailyCashflowMetrics selectedCashflow={selectedCashflow} />
          <DailyCashflowBillList bills={selectedCashflow.bills} />
        </>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          没有交易记录的日期不可选择。
        </p>
      )}
    </div>
  )
}

function DailyCashflowMetrics({
  selectedCashflow,
}: {
  selectedCashflow: DailyCashflowItem
}) {
  return (
    <div className="grid shrink-0 border-y border-border/70 sm:grid-cols-3">
      <DailyCashflowMetric label="收入" value={selectedCashflow.income} />
      <DailyCashflowMetric
        label="支出"
        value={selectedCashflow.expense}
        tone="destructive"
      />
      <DailyCashflowMetric
        label="结余"
        value={selectedCashflow.net}
        tone={selectedCashflow.net >= 0 ? "positive" : "destructive"}
        last
      />
    </div>
  )
}

function DailyCashflowMetric({
  label,
  value,
  tone = "positive",
  last = false,
}: {
  label: string
  value: number
  tone?: "positive" | "destructive"
  last?: boolean
}) {
  return (
    <div
      className={cn(
        "group/day-metric relative overflow-hidden border-b border-border/70 bg-transparent p-4 transition-colors duration-300 hover:bg-muted/50 sm:border-b-0",
        !last && "sm:border-r"
      )}
    >
      <div
        aria-hidden="true"
        className="absolute -right-2.5 -bottom-2.5 size-8 border border-border/35 bg-background/15 opacity-55 transition-[opacity,transform] duration-300 group-hover/day-metric:translate-x-0.5 group-hover/day-metric:-translate-y-0.5 group-hover/day-metric:opacity-70"
      />
      <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-heading text-xl leading-tight font-semibold tracking-tight tabular-nums",
          tone === "positive" ? "text-positive" : "text-destructive"
        )}
      >
        {formatMoney(value)}
      </p>
    </div>
  )
}

function DailyCashflowBillList({ bills }: { bills: DailyBillItem[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      {bills.map((bill) => (
        <DailyCashflowBill key={bill.id} bill={bill} />
      ))}
    </div>
  )
}

function DailyCashflowBill({ bill }: { bill: DailyBillItem }) {
  const signedAmount =
    bill.direction === "expense" ? -Math.abs(bill.amount) : bill.amount
  const signedRmb =
    bill.direction === "expense" ? -Math.abs(bill.rmb) : bill.rmb
  const badgeVariant =
    bill.direction === "income"
      ? "positive"
      : bill.direction === "expense"
        ? "destructive"
        : "secondary"

  return (
    <div className="grid gap-2 border-b border-border/70 bg-transparent p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">
              {bill.category}
              {bill.subcategory ? ` / ${bill.subcategory}` : ""}
            </p>
            <Badge variant={badgeVariant}>{bill.type}</Badge>
            {bill.tags.length ? (
              <>
                <span className="h-3 w-px bg-border" />
                <span className="flex min-w-0 flex-wrap items-center gap-1">
                  {bill.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </span>
              </>
            ) : null}
          </div>
          <p
            className="mt-1 truncate text-xs text-muted-foreground"
            title={`${bill.note} ${bill.location}`}
          >
            {bill.note || "无备注"}
            {bill.location ? ` · ${bill.location}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "font-heading text-base font-semibold",
              bill.direction === "income" && "text-positive",
              bill.direction === "expense" && "text-destructive"
            )}
          >
            {signedAmount.toLocaleString("zh-CN", {
              maximumFractionDigits: 2,
            })}{" "}
            {bill.currency}
          </p>
          <p className="text-xs text-muted-foreground">
            折算 {formatMoney(signedRmb)}
          </p>
        </div>
      </div>
    </div>
  )
}
