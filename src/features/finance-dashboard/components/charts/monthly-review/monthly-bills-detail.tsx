import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type {
  MonthlyBillItem,
  MonthlyItem,
} from "../../../model/analytics-types"
import { formatMoney, formatOriginalAmount } from "../../../model/money"
import { getDirectionBadgeVariant } from "../../../model/transaction-rules"

type MonthlyBillsDetailProps = {
  month: MonthlyItem
  onBack: () => void
}

export function MonthlyBillsDetail({ month, onBack }: MonthlyBillsDetailProps) {
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
        <Badge variant={getDirectionBadgeVariant(bill.direction)}>
          {bill.type}
        </Badge>
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
        {formatOriginalAmount(bill.amount, bill.currency)}
      </TableCell>
      <TableCell className="font-mono text-[11px] font-medium tabular-nums">
        {formatMoney(bill.rmb)}
      </TableCell>
    </TableRow>
  )
}
